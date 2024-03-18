import React, { useEffect, useReducer, useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { playerResultReducer } from '../helpers/reducers/playerResultReducer';
import { initialPlayerResultState, legLose, legWin, undo, updateStats } from '../helpers/reducers/playerResultActions';
import { achievementsReducer } from '../helpers/reducers/achievementsReducer';
import { initialAchievementsState, setHf, setMax, setOneSeventy, setQf } from '../helpers/reducers/achievementActions';
import Counter from './Counter';
import Stats from './Stats';
import { MATCH_DETAILS_API_URL } from '../helpers/apiConfig';

const Match = ({ route, navigation }) => {

  const [selectedComponent, setSelectedComponent] = useState('counter');

  const { match } = route.params;
  const playerA = match.match.playerA;
  const playerB = match.match.playerB;
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [isQFModalVisible, setIsQFModalVisible] = useState(false);
  const [matchClosed, setMatchClosed] = useState(false);

  const [playerAState, playerADispatch] = useReducer(playerResultReducer, initialPlayerResultState);

  const [playerBState, playerBDispatch] = useReducer(playerResultReducer, initialPlayerResultState);

  const [achievementsState, achievementsDispatch] = useReducer(achievementsReducer, initialAchievementsState);

  const [legStartingPlayer, setLegStartingPlayer] = useState();
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentResult, setCurrentResult] = useState(0);
  const [qfHelperDart, setQfHelperDart] = useState(0);

  const renderContent = () => {
    if(selectedComponent === 'counter'){
      return <Counter 
              playerA={playerA}
              playerB={playerB}
              playerAState={playerAState}
              playerBState={playerBState}
              currentPlayer={currentPlayer}
              currentResult={currentResult}
              handleNumberBtn={handleNumberBtn}
              handleOkBtn={handleOkBtn}
              handleUndoBtn={handleUndoBtn}
              handleClearBtn={handleClearBtn}
            />
    }else if(selectedComponent === 'stats'){
      return <Stats
              playerAName={playerA.name}
              playerBName={playerB.name}
              playerAState={playerAState}
              playerBState={playerBState}
            />
    }
  }

  const switchStartingPlayer = () => {
    if(legStartingPlayer === playerA){
      setLegStartingPlayer(playerB);
    }
    
    if(legStartingPlayer === playerB){
      setLegStartingPlayer(playerA);
    }
  };

  const toggleModal = () => {
    setIsModalVisible(visibility => !visibility);
  }

  const toggleQFModal = () => {
    setIsQFModalVisible(visibility => !visibility);
  }

  const handleBullWinnerSelection = (player) => {
    setLegStartingPlayer(player);
    setCurrentPlayer(player);
    toggleModal();
  }

  const handleNumberBtn = (number) => {
    if(matchClosed){
      return;
    }

    if(currentResult.toString().length < 3){
      setCurrentResult(result => parseInt(result.toString() + number, 10));
    }    
  }

  const handleClearBtn = () => {
    if(matchClosed){
      return;
    }
    setCurrentResult(0);
  };

  const handleMaxAndOneSeventy = () => {
    if(currentResult == 180){
      const max = {
        playerId: currentPlayer.playerId,
        tournamentId: match.match.tournamentId
      }
      achievementsDispatch(setMax(max));
    }

    if(currentResult >= 170 && currentResult < 180){
      const oneSeventy = {
        playerId: currentPlayer.playerId,
        value: currentResult,
        tournamentId: match.match.tournamentId
      }
      achievementsDispatch(setOneSeventy(oneSeventy));
    }
  };

  const handleHf = () => {
    if(currentResult >= 100){
      const hf = {
        playerId: currentPlayer.playerId,
        value: currentResult,
        tournamentId: match.match.tournamentId
      }
      achievementsDispatch(setHf(hf));
    }
  };

  const handleQf = (player, dart) => {
    if(dart < 20){
      const qf = {
        playerId: player.playerId,
        value: dart,
        tournamentId: match.match.tournamentId
      }
      achievementsDispatch(setQf(qf));
    }
  }

  const handleOkBtn = () => {
    if(matchClosed){
      return;
    }

    if(currentResult > 180 || currentResult.length <= 0){
      return
    }

    handleMaxAndOneSeventy();    

    if(currentPlayer === playerA){
      if(currentResult < playerAState.score - 1){
        playerADispatch(updateStats(currentResult));
        setCurrentPlayer(playerB);
      }
      if(currentResult == playerAState.score){
        Alert.alert(
          'UWAGA',
          `Czy ${playerA.name} wygrał lega?`,
          [
            { text: "NIE", style: 'cancel', onPress: () => {} },
            {
              text: 'TAK',
              style: 'destructive',
              onPress: () => {
                handleHf();
                handleCheckout(playerA)
              },
            },
          ]
        );
      }
    }

    if(currentPlayer === playerB){
      if(currentResult < playerBState.score - 1){
        playerBDispatch(updateStats(currentResult));
        setCurrentPlayer(playerA);
      }
      if(currentResult == playerBState.score){
        Alert.alert(
          'UWAGA',
          `Czy ${playerB.name} wygrał lega?`,
          [
            { text: "NIE", style: 'cancel', onPress: () => {} },
            {
              text: 'TAK',
              style: 'destructive',
              onPress: () => {
                handleHf();
                handleCheckout(playerB)
              },
            },
          ]
        );
      }
    }    
    setCurrentResult(0);
  }

  const handleCheckout = (player) => {

    if(player === playerA){
      if(playerAState.dartsThrown < 20){
        toggleQFModal();
        setQfHelperDart(playerAState.dartsThrown);
        return;
      }else{
        playerADispatch(legWin(3));
        playerBDispatch(legLose());
      }
    }
    
    if(player === playerB){
      if(playerBState.dartsThrown < 20){
        toggleQFModal();
        setQfHelperDart(playerBState.dartsThrown);
        return;
      }else{
        playerBDispatch(legWin(3));
        playerADispatch(legLose());
      }
    }    
  }

  const sendMatchResult = async (matchResultDTO) => {
    try{
      const response = await fetch(MATCH_DETAILS_API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchResultDTO)
      });

      if(response.ok){
        console.log('Zaktualizowano mecz');
      }else{
        console.error('Blad podczas aktualizacji meczu', response.statusText);
      }
    } catch (error) {
      console.error('Blad podczas strzalu do API przy aktualizowaniu meczu', error);
    }
  }

  const handleQFModalBtn = (dartNumber) => {    
    const dart = qfHelperDart + dartNumber;
    if(currentPlayer === playerA){
      handleQf(playerA, dart);
      playerADispatch(legWin(dartNumber));
      playerBDispatch(legLose());
      switchStartingPlayer();
    }
    
    if(currentPlayer === playerB){
      handleQf(playerB, dart);
      playerBDispatch(legWin(dartNumber));
      playerADispatch(legLose());
      switchStartingPlayer();
    }

    toggleQFModal();
  }

  const handleUndoBtn = () => {
    if(matchClosed){
      return;
    }

    if(playerAState.score == 501 && playerBState.score == 501){
      return
    }
    if(currentPlayer === playerA){
      setCurrentPlayer(playerB);
      playerBDispatch(undo());
    }
    if(currentPlayer === playerB){
      setCurrentPlayer(playerA);
      playerADispatch(undo());
    }
  }

  useEffect(() => {
    if(playerAState.legsWon == 2 || playerBState.legsWon == 2){
      setMatchClosed(true);
      let winner;
      let loser;

      if(playerAState.legsWon == 2){
        winner = playerA;
        loser = playerB;
      }else if(playerBState.legsWon == 2){
        winner = playerB;
        loser = playerA;
      }

      const matchResultDTO = {
        matchAchievementsDTO : achievementsState,
        updateMatchDTO : {
          tournamentId: match.match.tournamentId,
          matchId: match.match.matchId,
          winnerId: winner.playerId,
          loserId: loser.playerId,
          markup: match.match.markup,
          winnerDestinationMarkup: match.match.winnerDestinationMarkup,
          loserDestinationMarkup: match.match.loserDestinationMarkup,
          points: match.match.points
        }
      };

      sendMatchResult(matchResultDTO);

      console.log(matchResultDTO);
      Alert.alert(
        'MECZ ZAKOŃCZONY',
        `${loser.name} przegrał zatem pozostaje przy tarczy jako liczący.`,
        [
          {
            text: 'OK',
            style: 'destructive',
            onPress: () => {

            },
          },
        ]
      );
    }
  },[playerAState.legsWon, playerBState.legsWon]);

  useEffect(() => {
    setCurrentPlayer(legStartingPlayer);
  }, [legStartingPlayer])

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {

        e.preventDefault();

        Alert.alert(
          'UWAGA',
          'Czy na pewno chcesz opuścić mecz?',
          [
            { text: "KONTYNUUJ MECZ", style: 'cancel', onPress: () => {} },
            {
              text: 'OPUŚĆ MECZ',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ]
        );
      }),
    [navigation]
  );

  return (
    <View style={styles.container}>

      <Modal visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Kto rzuca pierwszy?</Text>
          <View style={styles.modalBtnsContainer}>
            <Pressable 
              style={styles.modalBtn} 
              onPress={() => handleBullWinnerSelection(playerA)}
            >
              <Text style={styles.modalBtnText}>{playerA.name}</Text>
            </Pressable>
            <Pressable 
              style={styles.modalBtn} 
              onPress={() => handleBullWinnerSelection(playerB)}
            >
              <Text style={styles.modalBtnText}>{playerB.name}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {currentPlayer && 
        <Modal visible={isQFModalVisible}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Którą lotką {currentPlayer.name} skończył lega?</Text>
            <View style={[styles.modalBtnsContainer, styles.qfModalBtnsContainer]}>
              <Pressable 
                style={[styles.modalBtn, styles.qfModalBtn]} 
                onPress={() => handleQFModalBtn(1)}
              >
                <Text style={styles.modalBtnText}>1</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, styles.qfModalBtn]} 
                onPress={() => handleQFModalBtn(2)}
              >
                <Text style={styles.modalBtnText}>2</Text>
              </Pressable>
              <Pressable 
                style={[styles.modalBtn, styles.qfModalBtn]} 
                onPress={() => handleQFModalBtn(3)}
              >
                <Text style={styles.modalBtnText}>3</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      }

      <View style={styles.navigationContainer}>
        <Pressable style={selectedComponent === "counter" ? [styles.navigationBtn, styles.selectedNavigationBtn] : [styles.navigationBtn]} onPress={() => setSelectedComponent('counter')}>
          <Text style={[styles.navigationBtnText]}>Wynik</Text>
        </Pressable>
        <Pressable style={selectedComponent === "stats" ? [styles.navigationBtn, styles.selectedNavigationBtn] : [styles.navigationBtn]} onPress={() => setSelectedComponent('stats')}>
          <Text style={styles.navigationBtnText}>Statystyki</Text>
        </Pressable>
      </View>

      {renderContent()}
      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#363062'
  },
  modalContainer:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#363062',
  },
  modalText: {
    color: '#c5c5c5',
    marginRight: 50,
    marginLeft: 50,
    marginBottom: 30,
    fontSize: 20,
    textAlign: 'center'
  },
  modalBtnsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingRight: 50,
    paddingLeft: 50,
  },
  qfModalBtnsContainer: {
    flexDirection: 'column'
  },
  modalBtn: {
    width: 120,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qfModalBtn: {
    marginTop: 30
  },
  modalBtnText: {
    color: '#c5c5c5',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 18
  },
  navigationContainer: {
    flexDirection: 'row'
  },
  navigationBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,.3)',
    paddingTop: 5,
    paddingBottom: 5,
  },
  selectedNavigationBtn: {
    backgroundColor: 'rgba(0,0,0,.3)'
  },
  navigationBtnText: {
    fontSize: 18,
    color: '#c5c5c5'
  },  
});

export default Match
