import React, { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { MATCH_ACTIVE_API_URL } from '../helpers/apiConfig'
import useAuth from '../hooks/useAuth';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons'; 

const MatchList = ({ navigation }) => {

  const { auth } = useAuth();

  const [matches, setMatches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const toggleModal = () => {
    setIsModalVisible(isModalVisible => !isModalVisible);
  }

  const handleMatchSelection = (match) => {
    setSelectedMatch(match);
    toggleModal();
  }

  const fetchMatches = async () => {
    try{
      const response = await fetch(MATCH_ACTIVE_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth?.accessToken}`
        }
      });
      const matches = await response.json();
      setMatches(matches);
    } catch (error) {
      console.log(error.message);
    }
  }

  const renderMatches = () => {
    return matches.map(match => {
      return <Pressable key={match.matchId} style={styles.matchContainer} onPress={() => handleMatchSelection(match)}>
              <View style={styles.match}>
                <Text style={styles.playerName}>{match.playerA.name}</Text>
                <Text style={styles.vs}>VS</Text>
                <Text style={styles.playerName}>{match.playerB.name}</Text>
              </View>
            </Pressable>
    })
  }

  const matchPressHandler = (match) => {
    toggleModal();
    navigation.navigate('Match', {match: {match}});
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchMatches();

      const refreshInterval = setInterval(() => {
        fetchMatches();
      }, 300000);

      return () => clearInterval(refreshInterval);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Pressable style={styles.refreshBtn} onPress={fetchMatches}>
        <FontAwesomeIcon style={styles.refreshIcon} icon={faSync} size={26}/>
        <Text style={styles.refreshText}>Odśwież</Text>
      </Pressable>
      <Text style={styles.header}>Mecze do rozegrania</Text>
      <View style={styles.matchesContainer}>
        {matches.length ? renderMatches() : <Text style={styles.noMatchesText}>Brak aktywnych meczy</Text>}
      </View>

      <Modal 
        visible={isModalVisible}
        animationType='slide'
      >
        {selectedMatch && 
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Czy na pewno chcesz rozpocząć ten mecz?</Text>
            <View style={styles.modalPlayersContainer}>
              <Text style={styles.modalPlayerName}>{selectedMatch.playerA.name}</Text>
              <Text style={styles.modalVS}>VS</Text>
              <Text style={styles.modalPlayerName}>{selectedMatch.playerB.name}</Text>
            </View>
            <View style={styles.modalBtnsContainer}>
              <Pressable style={styles.modalBtn} onPress={toggleModal}>
                <Text style={styles.modalBtnText}>Anuluj</Text>
              </Pressable>
              <Pressable style={styles.modalBtn} onPress={() => matchPressHandler(selectedMatch)}>
                <Text style={styles.modalBtnText}>Tak</Text>
              </Pressable>
            </View>
          </View>
        }
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363062',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#363062',
    alignItems: 'center',
    justifyContent: 'center'
  },
  refreshBtn: {
    position: 'absolute',
    right: 30,
    bottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c5c5c5',
    borderRadius: 5,
    padding: 8
  },
  refreshIcon: {
    color: '#c5c5c5'
  },
  refreshText: {
    color: '#c5c5c5'
  },
  header: {
    flex: 1,
    color: '#f5f5f5',
    fontSize: 22,
    marginTop: 20
  },
  matchesContainer: {
    flex: 7,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 15,
    marginRight: 15
  },
  matchContainer: {
    height: 70,
    width: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,.3)',
    justifyContent: 'center',
    alignItems: 'center',    
    marginTop: 15,    
  },
  match: {    
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    color: '#f5f5f5',
  },
  vs: {
    color: '#F99417'
  },
  noMatchesText: {
    color: '#c5c5c5',
    fontSize: 26
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
  modalPlayersContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50
  },
  modalPlayerName: {
    fontSize: 22,
    flex: 1,
    textAlign: 'center',
    color: '#c5c5c5',
    fontWeight: 'bold'
  },
  modalVS: {
    fontSize: 20,
    color: '#F99417'
  },
  modalBtnsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 50,
    paddingLeft: 50,
  },
  modalBtn: {
    width: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBtnText: {
    color: '#c5c5c5',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 18
  }
});
export default MatchList
