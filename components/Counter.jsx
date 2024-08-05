import React from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'

const Counter = ({ playerA, playerB, playerAState, playerBState, currentPlayer, currentResult, handleNumberBtn, handleOkBtn, handleUndoBtn, handleClearBtn }) => {
  return (
    <View style={styles.container}>
      <View style={styles.resultContainer}>
        <View style={styles.playerAContainer}>
          <Text style={styles.playerText}>{playerA.name} ({playerAState.dartsThrown})</Text>
        </View>
        <View style={styles.legsContainer}>
            <Text style={styles.legsResultText}>{playerAState.legsWon}</Text>
            <Text style={styles.legsText}>legi</Text>
            <Text style={styles.legsResultText}>{playerBState.legsWon}</Text>
        </View>
        <View style={styles.playerBContainer}>
          <Text style={styles.playerText}>({playerBState.dartsThrown}) {playerB.name}</Text>
        </View>
      </View>

      <View style={styles.countersContainer}>
        <View style={[styles.counterContainer, styles.counterContainerWithBorder]}>
          <Text style={[styles.counterText, (currentPlayer === playerA) && styles.goldText]}>{playerAState.score}</Text>
          <View style={styles.averagesContainer}>
            <Text style={styles.averageText}>
              ms: {playerAState.totalPointsEarned != 0 ? playerAState.matchAverage : '-'}
            </Text>
            <Text style={styles.averageText}>
              ls: {playerAState.score != 501 ? playerAState.currentLegAverage : '-'}
            </Text>
          </View>
        </View> 
        <View style={styles.counterContainer}>
          <Text style={[styles.counterText, (currentPlayer === playerB) && styles.goldText]}>{playerBState.score}</Text>
          <View style={styles.averagesContainer}>
            <Text style={styles.averageText}>
              ms: {playerBState.totalPointsEarned != 0 ? playerBState.matchAverage : '-'}
            </Text>
            <Text style={styles.averageText}>
              ls: {playerBState.score != 501 ? playerBState.currentLegAverage : '-'}
            </Text>
          </View>
        </View> 
      </View>

      <View style={styles.scoreContainer}>
        <View style={styles.score}>
          <Text style={styles.scoreText}>{currentResult > 0 ? currentResult : "Wprowadź wynik"}</Text>
        </View>

        <View style={styles.undoContainer}>
          <Pressable style={styles.undoBtn} onPress={handleUndoBtn}>
            <Text style={styles.undoText}>Cofnij</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.countContainer}>
        <View style={styles.countRow}>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('1')}>
            <Text style={styles.countNumberText}>1</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('2')}>
            <Text style={styles.countNumberText}>2</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('3')}>
            <Text style={styles.countNumberText}>3</Text>
          </Pressable>
        </View>
        <View style={styles.countRow}>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('4')}>
            <Text style={styles.countNumberText}>4</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('5')}>
            <Text style={styles.countNumberText}>5</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('6')}>
            <Text style={styles.countNumberText}>6</Text>
          </Pressable>
        </View>
        <View style={styles.countRow}>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('7')}>
            <Text style={styles.countNumberText}>7</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('8')}>
            <Text style={styles.countNumberText}>8</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('9')}>
            <Text style={styles.countNumberText}>9</Text>
          </Pressable>
        </View>
        <View style={styles.countRow}>
          <Pressable style={styles.countNumber} onPress={handleClearBtn}>
            <Text style={styles.countNumberText}>C</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={() => handleNumberBtn('0')}>
            <Text style={styles.countNumberText}>0</Text>
          </Pressable>
          <Pressable style={styles.countNumber} onPress={handleOkBtn}>
            <Text style={styles.countNumberText}>OK</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,.3)',
  },
  playerAContainer: {
    flex: 1,
    paddingLeft: 10
  },
  playerBContainer: {
    flex: 1,
    paddingRight: 10,
    alignItems: 'flex-end'
  },
  playerText: {
    fontSize: 18,
    color: '#c5c5c5'
  },
  legsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  legsText: {
    marginLeft: 15,
    marginRight: 15,
    fontSize: 20,
    color: '#c5c5c5'
  },
  legsResultText: {
    fontSize: 28,
    justifyContent: 'center',
    color: '#c5c5c5'
  },
  countersContainer: {
    flexDirection: 'row',
    flex: 1
  },
  counterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  counterContainerWithBorder: {
    borderRightWidth: 2,
    borderColor: 'rgba(0,0,0,.3)'
  },
  counterText: {
    fontSize: 100,
    flex: 1,
    justifyContent: 'center',
    textAlignVertical: 'center',
    color: '#c5c5c5'
  },
  goldText: {
    color: '#F99417'
  },
  averagesContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.3)'
  },
  averageText: {
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 18,
    color: '#c5c5c5'
  },
  scoreContainer: {
    flexDirection: 'row',
  },
  score: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#c5c5c5'    
  },
  undoContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,.3)'
  },
  undoBtn: {
    paddingRight: 10,
    backgroundColor: 'rgba(0,0,0,.4)',
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center'
  },
  undoText: {
    fontSize: 18,
    color: '#c5c5c5'
  },
  countContainer: {
    width: '100%'
  },
  countRow:{
    flexDirection: 'row'
  },
  countNumber: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: .5,
    borderColor: '#c5c5c5',
    paddingTop: 15,
    paddingBottom: 15
  },
  countNumberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c5c5c5'
  }
});

export default Counter
