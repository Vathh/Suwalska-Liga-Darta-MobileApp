import React, { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import useAuth from '../../hooks/useAuth';
import {
  QUICK_GAME_GAME_TYPES as GAME_TYPES,
  QUICK_GAME_SCORING_MODES as SCORING_MODES,
  normalizeLobbyGameType,
  useQuickGameLobbyState,
} from '../../hooks/useQuickGameLobbyState';
import { getReverbDiagnostics } from '../../helpers/apiConfig';
import {
  addQuickGameLobbyGuest,
  createQuickGameLobby,
  inviteToQuickGameLobby,
  leaveQuickGameLobby,
  markQuickGameLobbyReady,
  startQuickGameLobby,
  updateQuickGameLobbySettings,
} from '../../helpers/quickGameLobbyApi';
import { fetchFriends as fetchFriendsRequest } from '../../helpers/friendsApi';
import { addCachedTempName, getCachedTempNames } from '../../helpers/tempPlayerCache';
import ReverbDebugPanel from '../ReverbDebugPanel';
import MatchFormatPicker, { DEFAULT_MATCH_FORMAT } from './MatchFormatPicker';
import {
  formatMatchLabel,
  normalizeMatchFormat,
} from '../../helpers/matchFormat/matchFormat';
import { savePersistedMatchFormat } from '../../helpers/matchFormat/persistMatchFormat';
import { colors } from '../../theme/colors';

const MAX_LOBBY_PLAYERS = 8;

const playerKey = (item, index) =>
  String(item.id ?? item.playerId ?? item.player_id ?? item.tempName ?? index);

const INVITATION_STATUS = {
  sent: { key: 'sent', label: 'Wysłane', color: colors.accent },
  accepted: { key: 'accepted', label: 'Zaakceptowane', color: colors.success },
  rejected: { key: 'rejected', label: 'Odrzucone', color: colors.danger },
};

const QuickGameLobby = ({ navigation, route }) => {
  const { auth } = useAuth();
  const {
    lobby,
    setLobby,
    matchFormat,
    setMatchFormat,
    gameType,
    setGameType,
    scoringMode,
    setScoringMode,
    invitations,
    setInvitations,
    orderedPlayers,
    setOrderedPlayers,
    wsLive,
    applyLobbyData,
    fetchLobbyById,
  } = useQuickGameLobbyState({ route, navigation, auth, defaultMatchFormat: DEFAULT_MATCH_FORMAT });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [cachedGuestNames, setCachedGuestNames] = useState([]);
  const [addingGuest, setAddingGuest] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [myReady, setMyReady] = useState(false); // po kliknięciu Gotowy – nie pozwalaj klikać ponownie
  const reverbDiag = getReverbDiagnostics();

  const resolveMyPlayerIndex = useCallback((players, fromApi) => {
    if (fromApi !== undefined && fromApi !== null) return fromApi;
    if (auth?.playerId == null) return null;
    const idx = players.findIndex(
      (p) => p.playerId != null && Number(p.playerId) === Number(auth.playerId),
    );
    return idx >= 0 ? idx : null;
  }, [auth?.playerId]);

  const handleCreate = async () => {
    setError('');
    setLoading(true);
    try {
      const { ok, data } = await createQuickGameLobby(auth?.accessToken);
      if (ok && data?.id) {
        setLobby({ ...data, gameType: data.gameType ?? data.game_type ?? GAME_TYPES.X01 });
        setMatchFormat(normalizeMatchFormat(data.matchFormat ?? matchFormat));
        setGameType(data.gameType ?? data.game_type ?? GAME_TYPES.X01);
        setInvitations([]);
        fetchLobbyById(data.id);
      } else {
        setError(data?.message || 'Nie udało się utworzyć lobby');
      }
    } catch (e) {
      setError('Błąd połączenia');
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = useCallback(async () => {
    if (!auth?.accessToken) return;
    setFriendsLoading(true);
    try {
      const { ok, data } = await fetchFriendsRequest(auth.accessToken);
      setFriends(ok ? (Array.isArray(data) ? data : (data?.friends ?? data?.data ?? [])) : []);
    } catch (e) {
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  }, [auth?.accessToken]);

  const openInviteModal = () => {
    setInviteModalVisible(true);
    fetchFriends();
  };

  const openGuestModal = async () => {
    setGuestName('');
    setGuestModalVisible(true);
    const names = await getCachedTempNames();
    setCachedGuestNames(names);
  };

  const handleAddGuest = async () => {
    const name = guestName.trim();
    if (!lobby?.id || !auth?.accessToken || !name) {
      Alert.alert('Błąd', 'Podaj imię gracza tymczasowego');
      return;
    }
    setAddingGuest(true);
    try {
      const { ok, data } = await addQuickGameLobbyGuest(lobby.id, auth.accessToken, name);
      if (ok) {
        await addCachedTempName(name);
        applyLobbyData(data, lobby.id);
        setGuestModalVisible(false);
        if (scoringMode === SCORING_MODES.EACH_OWN) {
          setScoringMode(SCORING_MODES.ONE_DEVICE);
          handleUpdateSettings({ scoringMode: SCORING_MODES.ONE_DEVICE });
        }
      } else {
        Alert.alert('Błąd', data?.message || 'Nie udało się dodać gracza');
      }
    } catch (e) {
      Alert.alert('Błąd', 'Błąd połączenia');
    } finally {
      setAddingGuest(false);
    }
  };

  const handleInviteFriend = async (friend) => {
    if (!lobby?.id || !auth?.accessToken) return;
    const playerId = friend.playerId ?? friend.id ?? friend.player_id;
    const name = friend.name ?? friend.playerName ?? 'Znajomy';
    try {
      const { ok, data } = await inviteToQuickGameLobby(
        lobby.id,
        auth.accessToken,
        playerId ?? friend.userId ?? friend.user_id,
      );
      if (ok) {
        setInvitations((prev) => [...prev, { id: friend.id ?? playerId, name, status: 'sent' }]);
        setInviteModalVisible(false);
      } else {
        Alert.alert('Błąd', data?.message || 'Nie udało się wysłać zaproszenia');
      }
    } catch (e) {
      Alert.alert('Błąd', 'Błąd połączenia');
    }
  };

  const handleLeave = async () => {
    if (!lobby?.id || !auth?.accessToken) return;
    try {
      await leaveQuickGameLobby(lobby.id, auth.accessToken);
      setLobby(null);
    } catch (e) {
      console.warn('leave', e);
    }
  };

  const handleReady = async () => {
    if (!lobby?.id || !auth?.accessToken || myReady) return;
    try {
      await markQuickGameLobbyReady(lobby.id, auth.accessToken);
      setMyReady(true);
      fetchLobbyById(lobby.id);
    } catch (e) {
      console.warn('ready', e);
    }
  };

  const handleUpdateSettings = async (updates) => {
    if (!lobby?.id || !auth?.accessToken || !lobby.youAreHost) return;
    try {
      const { ok, data } = await updateQuickGameLobbySettings(lobby.id, auth.accessToken, updates);
      if (ok) {
        setLobby((prev) => ({ ...prev, ...data }));
      }
    } catch (e) {
      console.warn('handleUpdateSettings', e);
    }
  };

  const handleStart = async () => {
    if (!lobby?.id || !auth?.accessToken) return;
    try {
      const { ok, data } = await startQuickGameLobby(lobby.id, auth.accessToken, {
        matchFormat: normalizeMatchFormat({
          ...matchFormat,
          gameType: gameType ?? lobby?.gameType ?? GAME_TYPES.X01,
        }),
        gameType: gameType ?? lobby?.gameType ?? GAME_TYPES.X01,
        scoringMode: scoringMode ?? lobby?.scoringMode ?? SCORING_MODES.EACH_OWN,
        playerOrder: (orderedPlayers.length ? orderedPlayers : (lobby?.players || []))
          .map((p) => p.id)
          .filter(Boolean),
      });
      if (ok && data?.players) {
        const gameTypeToUse = normalizeLobbyGameType(
          data.gameType ?? gameType ?? lobby?.gameType ?? GAME_TYPES.X01,
        );
        const format = normalizeMatchFormat({
          ...(data.matchFormat ?? matchFormat),
          gameType: gameTypeToUse,
        });
        await savePersistedMatchFormat('quickGame', format);
        const toPass = (orderedPlayers.length ? orderedPlayers : data.players).map((p) => ({
          id: p.id,
          name: p.name ?? p.tempName ?? 'Gracz',
          playerId: p.playerId ?? p.player_id,
        }));
        const scoringModeToUse =
          data.scoringMode ?? scoringMode ?? lobby?.scoringMode ?? SCORING_MODES.EACH_OWN;
        const isHost = data.isHost ?? lobby?.youAreHost ?? false;
        const myPlayerIndex = resolveMyPlayerIndex(toPass, data.myPlayerIndex);
        setLobby(null);
        navigation.navigate('GameScoring', {
          quickGame: {
            players: toPass,
            lobbyId: lobby.id,
            matchFormat: format,
            gameType: gameTypeToUse,
            scoringMode: scoringModeToUse,
            isHost,
            myPlayerIndex,
          },
        });
      } else {
        Alert.alert('Błąd', data?.message || 'Nie można rozpocząć meczu');
      }
    } catch (e) {
      Alert.alert('Błąd', 'Błąd połączenia');
    }
  };

  const backToChoice = () => {
    setLobby(null);
    setInvitations([]);
    setMyReady(false);
    setError('');
  };

  if (lobby?.id) {
    const players = lobby.players || [];
    // Gdy serwer (WS/HTTP) ma więcej graczy niż lokalna kolejność — pokaż stan z serwera (inaczej host nie widzi dołączających).
    const listData =
      players.length > orderedPlayers.length
        ? players
        : orderedPlayers.length
          ? orderedPlayers
          : players;
    const isHost = lobby.youAreHost === true;
    const hasTempGuests = players.some((p) => p.isRegistered === false && !p.isHost);
    // Gotowość tylko zarejestrowanych; host jest zawsze uznawany za gotowego, goście nie liczą się
    const allRegisteredReady =
      players.length >= 2 &&
      players.every((p) => !p.isRegistered || p.isHost || p.ready);

    const listHeader = (
      <>
        <Text style={styles.title}>Lobby quick game</Text>
        <Text style={[styles.hintSmall, wsLive ? styles.wsLive : styles.wsOffline]}>
          Live sync: {wsLive ? 'połączono' : 'offline'}
          {' · '}
          {reverbDiag.wsHost}:{reverbDiag.wsPort}
          {' · key '}
          {reverbDiag.keyPrefix}…
          {reverbDiag.keyLooksDefault ? ' (domyślny — zły build!)' : ''}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.label}>Typ gry</Text>
          <View style={styles.gameTypeRow}>
            <Pressable
              style={[styles.gameTypeBtn, gameType === GAME_TYPES.X01 && styles.gameTypeBtnActive]}
              onPress={() => {
                if (isHost) {
                  setGameType(GAME_TYPES.X01);
                  const next = normalizeMatchFormat({ ...matchFormat, gameType: GAME_TYPES.X01 });
                  setMatchFormat(next);
                  handleUpdateSettings({ gameType: GAME_TYPES.X01, matchFormat: next });
                }
              }}
              disabled={!isHost}
            >
              <Text style={[styles.gameTypeBtnText, gameType === GAME_TYPES.X01 && styles.gameTypeBtnTextActive]}>501</Text>
            </Pressable>
            <Pressable
              style={[styles.gameTypeBtn, gameType === GAME_TYPES.CRICKET && styles.gameTypeBtnActive]}
              onPress={() => {
                if (isHost) {
                  setGameType(GAME_TYPES.CRICKET);
                  const next = normalizeMatchFormat({
                    ...matchFormat,
                    gameType: GAME_TYPES.CRICKET,
                    setsToWinMatch: 1,
                  });
                  setMatchFormat(next);
                  handleUpdateSettings({
                    gameType: GAME_TYPES.CRICKET,
                    matchFormat: next,
                  });
                }
              }}
              disabled={!isHost}
            >
              <Text style={[styles.gameTypeBtnText, gameType === GAME_TYPES.CRICKET && styles.gameTypeBtnTextActive]}>Cricket</Text>
            </Pressable>
          </View>
          {gameType === GAME_TYPES.CRICKET ? (
            <Text style={styles.hintSmall}>
              Cricket: standard scoring, tylko legi (bez setów). Działa na 1 urządzeniu i każdy na swoim.
            </Text>
          ) : null}
        </View>

        <View style={styles.section}>
          {isHost ? (
            <MatchFormatPicker
              value={matchFormat}
              allowCricket={false}
              onChange={(next) => {
                const withType = normalizeMatchFormat({
                  ...next,
                  gameType: gameType === GAME_TYPES.CRICKET ? GAME_TYPES.CRICKET : GAME_TYPES.X01,
                });
                setMatchFormat(withType);
                handleUpdateSettings({ matchFormat: withType, gameType: withType.gameType });
              }}
            />
          ) : (
            <>
              <Text style={styles.label}>Format meczu</Text>
              <Text style={styles.formatValue}>{formatMatchLabel(matchFormat)}</Text>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Liczenie</Text>
          <View style={styles.gameTypeRow}>
            <Pressable
              style={[styles.gameTypeBtn, scoringMode === SCORING_MODES.ONE_DEVICE && styles.gameTypeBtnActive]}
              onPress={() => {
                if (isHost) {
                  setScoringMode(SCORING_MODES.ONE_DEVICE);
                  handleUpdateSettings({ scoringMode: SCORING_MODES.ONE_DEVICE });
                }
              }}
              disabled={!isHost}
            >
              <Text style={[styles.gameTypeBtnText, scoringMode === SCORING_MODES.ONE_DEVICE && styles.gameTypeBtnTextActive]}>Na 1 urządzeniu</Text>
            </Pressable>
            <Pressable
              style={[
                styles.gameTypeBtn,
                scoringMode === SCORING_MODES.EACH_OWN && styles.gameTypeBtnActive,
                hasTempGuests && styles.gameTypeBtnDisabled,
              ]}
              onPress={() => {
                if (isHost && !hasTempGuests) {
                  setScoringMode(SCORING_MODES.EACH_OWN);
                  handleUpdateSettings({ scoringMode: SCORING_MODES.EACH_OWN });
                }
              }}
              disabled={!isHost || hasTempGuests}
            >
              <Text style={[styles.gameTypeBtnText, scoringMode === SCORING_MODES.EACH_OWN && styles.gameTypeBtnTextActive]}>Każdy na swoim</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Gracze</Text>
          {isHost && players.length < MAX_LOBBY_PLAYERS && (
            <>
              <Pressable style={styles.inviteButton} onPress={openInviteModal}>
                <Text style={styles.inviteButtonText}>+ Zaproś znajomego</Text>
              </Pressable>
              <Pressable style={styles.inviteButtonSecondary} onPress={openGuestModal}>
                <Text style={styles.inviteButtonTextSecondary}>+ Dodaj gracza tymczasowego</Text>
              </Pressable>
            </>
          )}
          {isHost && players.length >= MAX_LOBBY_PLAYERS && (
            <Text style={styles.hintSmall}>Osiągnięto limit {MAX_LOBBY_PLAYERS} graczy w lobby.</Text>
          )}
          {invitations.length > 0 && (
            <>
              <Text style={styles.subLabel}>Zaproszenia</Text>
              {invitations.map((inv) => {
                const statusInfo = INVITATION_STATUS[inv.status] ?? INVITATION_STATUS.sent;
                return (
                    <View key={inv.id} style={styles.invitationRow}>
                    <Text style={styles.invitationName}>{inv.name}</Text>
                    <Text style={[styles.invitationStatusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                );
              })}
            </>
          )}
          {/* {isHost && invitations.length === 0 && players.length < 2 && (
            <Text style={styles.hintSmall}>Zaproś znajomych lub dodaj gracza tymczasowego (bez konta).</Text>
          )} */}
        </View>
      </>
    );

    const shufflePlayerOrder = () => {
      const arr = [...listData];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setOrderedPlayers(arr);
    };

    const renderPlayerLabel = (item) => (
      <>
        {item.name || item.tempName || 'Gracz'}
        {item.isRegistered === false && !item.isHost ? ' (tymczasowy)' : ''}
        {item.ready ? ' ✓ Gotowy' : ''}
      </>
    );

    const lobbyFooter = (
      <>
        {auth?.accessToken && (
          <>
            {!isHost && (
              <Pressable
                style={[styles.button, myReady && styles.buttonDisabled]}
                onPress={handleReady}
                disabled={myReady}
              >
                <Text style={[styles.buttonText, myReady && styles.buttonTextDisabled]}>
                  {myReady ? 'Gotowy ✓' : 'Gotowy'}
                </Text>
              </Pressable>
            )}
            {isHost && (
              <Pressable
                style={[styles.button, !allRegisteredReady && styles.buttonDisabled]}
                onPress={handleStart}
                disabled={!allRegisteredReady}
              >
                <Text style={styles.buttonText}>Rozpocznij mecz</Text>
              </Pressable>
            )}
            <Pressable style={styles.buttonOutlined} onPress={handleLeave}>
              <Text style={styles.buttonOutlinedText}>Opuść lobby</Text>
            </Pressable>
          </>
        )}
        <Pressable style={styles.buttonOutlined} onPress={backToChoice}>
          <Text style={styles.buttonOutlinedText}>Wróć</Text>
        </Pressable>
        <ReverbDebugPanel />
      </>
    );

    const lobbyModals = (
      <>
        <Modal
          visible={inviteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setInviteModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setInviteModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Zaproś znajomego</Text>
              {friendsLoading ? (
                <Text style={styles.hintSmall}>Ładowanie listy znajomych…</Text>
              ) : friends.length === 0 ? (
                <Text style={styles.hintSmall}>Brak znajomych lub błąd ładowania.</Text>
              ) : (
                <ScrollView style={styles.friendsList}>
                  {friends.map((f) => {
                    const name = f.name ?? f.playerName ?? f.player?.name ?? 'Znajomy';
                    const alreadyInvited = invitations.some((i) => i.id === (f.playerId ?? f.id) || i.name === name);
                    return (
                      <Pressable
                        key={f.id ?? f.playerId}
                        style={[styles.friendRow, alreadyInvited && styles.friendRowDisabled]}
                        onPress={() => !alreadyInvited && handleInviteFriend(f)}
                        disabled={alreadyInvited}
                      >
                        <Text style={styles.friendRowText}>{name}</Text>
                        {alreadyInvited && <Text style={styles.hintSmall}>(zaproszony)</Text>}
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}
              <Pressable style={styles.buttonSecondary} onPress={() => setInviteModalVisible(false)}>
                <Text style={styles.buttonTextSecondary}>Zamknij</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
        <Modal
          visible={guestModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setGuestModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setGuestModalVisible(false)}>
            <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Gracz tymczasowy</Text>
              <Text style={styles.hintSmall}>
                Osoba bez konta — host wpisuje jej rzuty (tryb na 1 urządzeniu).
              </Text>
              <TextInput
                style={styles.guestInput}
                value={guestName}
                onChangeText={setGuestName}
                placeholder="Imię zawodnika"
                placeholderTextColor={colors.placeholder}
                maxLength={50}
                autoCapitalize="words"
              />
              {cachedGuestNames.length > 0 && (
                <View style={styles.cachedNamesWrap}>
                  <Text style={styles.hintSmall}>Ostatnio używane:</Text>
                  <View style={styles.cachedNamesRow}>
                    {cachedGuestNames.slice(0, 6).map((n) => (
                      <Pressable key={n} style={styles.cachedNameChip} onPress={() => setGuestName(n)}>
                        <Text style={styles.cachedNameChipText}>{n}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
              <Pressable
                style={[styles.button, addingGuest && styles.buttonDisabled]}
                onPress={handleAddGuest}
                disabled={addingGuest}
              >
                <Text style={styles.buttonText}>{addingGuest ? 'Dodawanie…' : 'Dodaj do lobby'}</Text>
              </Pressable>
              <Pressable style={styles.buttonSecondary} onPress={() => setGuestModalVisible(false)}>
                <Text style={styles.buttonTextSecondary}>Anuluj</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );

    const playersSectionHeader = (
      <View style={styles.section}>
        <Text style={styles.label}>
          {isHost ? 'Gracze w lobby (kolejność rzucania od góry)' : 'Gracze w lobby'}
        </Text>
        {isHost && listData.length > 0 ? (
          <Text style={styles.hintSmall}>
            Przytrzymaj wiersz i przeciągnij, aby zmienić kolejność. Możesz też użyć „Kolejność losowa”.
          </Text>
        ) : null}
      </View>
    );

    const hostDraggableList = isHost && listData.length > 0;

    return (
      <View style={styles.container}>
        {hostDraggableList ? (
          <DraggableFlatList
            data={listData}
            keyExtractor={playerKey}
            onDragEnd={({ data }) => setOrderedPlayers(data)}
            containerStyle={styles.scroll}
            contentContainerStyle={styles.formContent}
            ListHeaderComponent={
              <>
                {listHeader}
                {playersSectionHeader}
              </>
            }
            renderItem={({ item, drag, isActive }) => (
              <ScaleDecorator>
                <Pressable
                  onLongPress={drag}
                  disabled={isActive}
                  style={[styles.playerTile, isActive && styles.playerTileActive]}
                >
                  <Text style={styles.playerTileName} numberOfLines={1}>
                    {renderPlayerLabel(item)}
                  </Text>
                  <View style={styles.dragHandle}>
                    <Text style={styles.dragHandleText}>≡</Text>
                  </View>
                </Pressable>
              </ScaleDecorator>
            )}
            ListFooterComponent={
              <>
                <Pressable style={styles.reorderButtonSecondary} onPress={shufflePlayerOrder}>
                  <Text style={styles.reorderButtonTextSecondary}>Kolejność losowa</Text>
                </Pressable>
                {lobbyFooter}
              </>
            }
          />
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator>
            {listHeader}
            <View style={styles.section}>
              <Text style={styles.label}>Gracze w lobby</Text>
              {listData.length === 0 ? (
                <View style={styles.emptyPlayersBox}>
                  <Text style={styles.emptyPlayersText}>Jeszcze brak graczy w lobby.</Text>
                </View>
              ) : (
                <View style={styles.playersList}>
                  {(isHost ? listData : players).map((item, index) => (
                    <View key={playerKey(item, index)} style={styles.playerTile}>
                      <Text style={styles.playerTileName} numberOfLines={1}>
                        {renderPlayerLabel(item)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            {lobbyFooter}
          </ScrollView>
        )}
        {lobbyModals}
      </View>
    );
  }

  // Ekran początkowy: jeden przycisk „Utwórz lobby” – od razu tworzy lobby i wchodzi w widok lobby
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Szybki mecz – Lobby</Text>
      <Text style={styles.hint}>
        Utwórz lobby i zaproś znajomych do gry. Ustawienia i zaproszenia zarządzasz w lobby.
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        style={styles.button}
        onPress={handleCreate}
        disabled={!auth?.accessToken || loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Tworzenie lobby…' : 'Utwórz lobby'}</Text>
      </Pressable>
      {!auth?.accessToken && (
        <Text style={styles.hint}>
          Zaloguj się, aby móc tworzyć lobby i zapraszać znajomych.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  formContent: {
    padding: 24,
    paddingBottom: 40,
  },
  scroll: {
    flex: 1,
  },
  playersList: {
    marginTop: 8,
  },
  dragListContainer: {
    marginTop: 8,
  },
  reorderButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accentBorder,
    backgroundColor: 'transparent',
  },
  reorderButtonTextSecondary: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    color: colors.textMuted,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  hintSmall: {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 4,
    marginBottom: 8,
  },
  formatValue: {
    fontSize: 16,
    color: colors.bg,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 4,
  },
  error: {
    fontSize: 14,
    color: colors.dangerAlt,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: colors.accent,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  playerRow: {
    fontSize: 16,
    color: colors.textMuted,
    marginVertical: 4,
  },
  emptyPlayersBox: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  emptyPlayersText: {
    fontSize: 16,
    color: colors.textDim,
    marginBottom: 4,
  },
  playerTile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerTileActive: {
    backgroundColor: colors.bgElevatedHover,
    opacity: 0.95,
  },
  playerTileName: {
    flex: 1,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dragHandle: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginLeft: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandleText: {
    fontSize: 26,
    color: colors.accent,
    fontWeight: '700',
    lineHeight: 28,
  },
  input: {
    marginBottom: 4,
    padding: 12,
    backgroundColor: colors.chipLight,
    borderRadius: 8,
    fontSize: 16,
    color: colors.bg,
  },
  invitationsBox: {
    marginBottom: 8,
    paddingVertical: 8,
  },
  invitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    marginBottom: 8,
  },
  invitationName: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  invitationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invitationStatusIcon: {
    marginRight: 6,
  },
  invitationStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  inviteButtonText: {
    fontSize: 16,
    color: colors.bg,
    fontWeight: 'bold',
  },
  inviteButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  inviteButtonTextSecondary: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: 'bold',
  },
  subLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 8,
    marginTop: 4,
  },
  gameTypeBtnDisabled: {
    opacity: 0.45,
  },
  guestInput: {
    backgroundColor: colors.chipLight,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.bg,
    marginBottom: 12,
  },
  cachedNamesWrap: {
    marginBottom: 12,
  },
  cachedNamesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  cachedNameChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
  },
  cachedNameChipText: {
    color: colors.text,
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.bg,
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonTextDisabled: {
    color: colors.textDisabled,
  },
  buttonOutlined: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: 'transparent',
  },
  buttonOutlinedText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    paddingVertical: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: colors.textMuted,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    color: colors.accent,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  friendsList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  friendRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendRowDisabled: {
    opacity: 0.6,
  },
  friendRowText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  gameTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  gameTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    backgroundColor: colors.scrimSoft,
    alignItems: 'center',
  },
  gameTypeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  gameTypeBtnText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  gameTypeBtnTextActive: {
    color: colors.accent,
  },
  wsLive: {
    color: colors.success,
  },
  wsOffline: {
    color: colors.danger,
  },
});

export default QuickGameLobby;

