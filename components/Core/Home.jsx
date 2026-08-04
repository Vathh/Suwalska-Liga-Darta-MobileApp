import React, { useCallback, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import useAuth from '../../hooks/useAuth'
import {
	buildGameScoringParamsFromActiveGame,
	resolveActiveFfaGame,
} from '../../helpers/activeQuickGame'
import { postFfaPresence } from '../../helpers/quickGameFfaApi'
import { colors } from '../../theme/colors'

const Home = ({ navigation }) => {

  const { auth } = useAuth()
  const [activeGame, setActiveGame] = useState(null)
  const [leavingGame, setLeavingGame] = useState(false)

  useFocusEffect(
    useCallback(() => {
      let cancelled = false

      if (!auth?.accessToken) {
        setActiveGame(null)
        return () => {
          cancelled = true
        }
      }

      setActiveGame(null)

      resolveActiveFfaGame(auth.accessToken)
        .then((game) => {
          if (!cancelled) {
            setActiveGame(game)
          }
        })
        .catch(() => {
          if (!cancelled) {
            setActiveGame(null)
          }
        })

      return () => {
        cancelled = true
      }
    }, [auth?.accessToken]),
  )

  const tournamentModeHandler = () => {
    navigation.navigate('TournamentCode')
  }

  const quickGameOnlineHandler = () => {
    if (auth?.accessToken) {
      navigation.navigate('QuickGameLobby')
    } else {
      Alert.alert(
        'Quick game online',
        'Wymagane konto i internet. Zaloguj się, aby utworzyć lobby ze znajomymi.',
        [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Zaloguj', onPress: () => navigation.navigate('AccountLogin') },
        ],
      )
    }
  }

  const resumeGameHandler = () => {
    const params = buildGameScoringParamsFromActiveGame(activeGame)
    if (params) {
      navigation.navigate('GameScoring', params)
    }
  }

  const leaveGameHandler = () => {
    if (!activeGame?.lobbyId || !auth?.accessToken || leavingGame) {
      return
    }

    const playerCount = activeGame?.players?.length ?? 0
    const message =
      playerCount === 2
        ? 'Opuścisz mecz bez możliwości powrotu. Przeciwnik wygra walkowerem — tak samo jak przy wyjściu z ekranu gry.'
        : 'Opuścisz mecz bez możliwości powrotu. To samo zachowanie jak przy wyjściu z ekranu gry.'

    Alert.alert('Opuścić mecz?', message, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Opuść',
        style: 'destructive',
        onPress: async () => {
          setLeavingGame(true)
          try {
            await postFfaPresence(activeGame.lobbyId, auth.accessToken, 'left')
          } catch {
            // i tak czyścimy lokalny stan — użytkownik chce wyjść
          }
          setActiveGame(null)
          setLeavingGame(false)
        },
      },
    ])
  }

	const trainingHandler = () => {
    navigation.navigate('TrainingHub')
  }

  const opponentNames =
    activeGame?.players
      ?.filter((_, index) => index !== activeGame.myPlayerIndex)
      ?.map((p) => p.name)
      ?.join(', ') ?? 'przeciwnikiem'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wybierz tryb gry</Text>
      <View style={styles.form}>
        {activeGame ? (
          <View style={styles.resumeBlock}>
            <Text style={styles.resumeContext}>
              Quick game z {opponentNames}
            </Text>
            <View style={styles.resumeRow}>
              <Pressable
                style={[styles.buttonResume, styles.resumeRowButton]}
                onPress={resumeGameHandler}
                disabled={leavingGame}
              >
                <Text style={styles.buttonResumeText}>Wróć do meczu</Text>
              </Pressable>
              <Pressable
                style={[styles.buttonLeave, styles.resumeRowButton]}
                onPress={leaveGameHandler}
                disabled={leavingGame}
              >
                <Text style={styles.buttonLeaveText}>
                  {leavingGame ? 'Opuszczanie…' : 'Opuść'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <Pressable style={styles.button} onPress={tournamentModeHandler}>
          <Text style={styles.buttonText}>Turniej</Text>
          <Text style={styles.buttonHint}>Wymagany kod logowania</Text>
        </Pressable>
        {auth?.accessToken ? (
          <Pressable
            style={styles.button}
            onPress={() => navigation.navigate('JoinTournament')}
          >
            <Text style={styles.buttonText}>Dołącz do turnieju</Text>
            <Text style={styles.buttonHint}>Kod / QR od organizatora</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.button} onPress={quickGameOnlineHandler}>
          <Text style={styles.buttonText}>Szybka gra online</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={trainingHandler}>
          <Text style={styles.buttonText}>Trening</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    color: colors.textMuted,
    marginBottom: 48,
    marginTop: 100,
    textAlign: 'center',
  },
  form: {
    alignItems: 'stretch',
    width: '100%',
    maxWidth: 320,
  },
  resumeBlock: {
    marginBottom: 8,
  },
  resumeContext: {
    marginBottom: 8,
    fontSize: 12,
    color: colors.successSoftText,
    textAlign: 'center',
  },
  resumeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resumeRowButton: {
    flex: 1,
  },
  buttonResume: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.successMuted,
    borderRadius: 8,
  },
  buttonResumeText: {
    color: colors.successSoftText,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonLeave: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: colors.dangerMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  buttonLeaveText: {
    color: colors.dangerText,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.bgElevated,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  buttonHint: {
    marginTop: 5,
    fontSize: 13,
    color: colors.text,
    opacity: 0.85,
    textAlign: 'center',
  },
})

export default Home
