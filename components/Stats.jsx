import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import StatsRow from './StatsRow';
import StatsTitleRow from './StatsTitleRow';

const Stats = ({ playerAName, playerBName, playerAState, playerBState }) => {

  const playerABestLegAverage = playerAState.legsAverages.length > 0 ? Math.max(...playerAState.legsAverages) : playerAState.currentLegAverage;
  const playerBBestLegAverage = playerBState.legsAverages.length > 0 ? Math.max(...playerBState.legsAverages) : playerBState.currentLegAverage;

  const playerABestLegThrows = playerAState.dartsPerLeg.length > 0 ? Math.min(...playerAState.dartsPerLeg) : "-";
  const playerBBestLegThrows = playerBState.dartsPerLeg.length > 0 ? Math.min(...playerBState.dartsPerLeg) : "-";

  const getThrowsBetween = (arrayOfArrays, min, max) => {
    return arrayOfArrays.reduce((accumulator, currentArray) => {
      const filteredCount = currentArray.filter(value => value >= min && value < max).length;
      return accumulator + filteredCount;
    }, 0);
  };

  const getMax = (arrayOfArrays) => {
    return arrayOfArrays.reduce((accumulator, currentArray) => {
      const filteredCount = currentArray.filter(value => value == 180).length;
      return accumulator + filteredCount;
    }, 0);
  }

  const playerAStats = {
    plus60: getThrowsBetween([...playerAState.legByLegScores, playerAState.currentLegScores], 60, 80),
    plus80: getThrowsBetween([...playerAState.legByLegScores, playerAState.currentLegScores], 80, 100),
    plus100 : getThrowsBetween([...playerAState.legByLegScores, playerAState.currentLegScores], 100, 140),
    plus140: getThrowsBetween([...playerAState.legByLegScores, playerAState.currentLegScores], 140, 180),
    max: getMax([...playerAState.legByLegScores, playerAState.currentLegScores])
  }

  const playerBStats = {
    plus60: getThrowsBetween([...playerBState.legByLegScores, playerBState.currentLegScores], 60, 80),
    plus80: getThrowsBetween([...playerBState.legByLegScores, playerBState.currentLegScores], 80, 100),
    plus100 : getThrowsBetween([...playerBState.legByLegScores, playerBState.currentLegScores], 100, 140),
    plus140: getThrowsBetween([...playerBState.legByLegScores, playerBState.currentLegScores], 140, 180),
    max: getMax([...playerBState.legByLegScores, playerBState.currentLegScores])
  }


  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.darkRow]}>
        <View style={styles.leftRowSide}>
          <Text style={styles.headerText}></Text>
        </View>
        <View style={styles.rightRowSide}>
          <Text style={styles.headerText}>{playerAName}</Text>
          <Text style={styles.headerText}>{playerBName}</Text>
        </View>
      </View>

      <StatsTitleRow title="Średnia (3 lotki)"/>

      <StatsRow 
        title="Cała gra"
        playerAValue= {playerAState.matchAverage}
        playerBValue= {playerBState.matchAverage}
      />
      <StatsRow 
        title="Najlepszy leg"
        playerAValue= {playerABestLegAverage}
        playerBValue= {playerBBestLegAverage}
      />
      <StatsRow 
        title="Aktualny leg"
        playerAValue= {isNaN(playerAState.currentLegAverage) ? '-' : playerAState.currentLegAverage} 
        playerBValue= {isNaN(playerBState.currentLegAverage) ? '-' : playerBState.currentLegAverage}
      />

      <StatsTitleRow title="Osiągi"/>

      <StatsRow 
        title="Najlepszy leg"
        playerAValue= {playerABestLegThrows}
        playerBValue= {playerBBestLegThrows}
      />
      <StatsRow 
        title="60+"
        playerAValue= {playerAStats.plus60}
        playerBValue= {playerBStats.plus60}
      />
      <StatsRow 
        title="80+"
        playerAValue= {playerAStats.plus80}
        playerBValue= {playerBStats.plus80}
      />
      <StatsRow 
        title="100+"
        playerAValue= {playerAStats.plus100}
        playerBValue= {playerBStats.plus100}
      />
      <StatsRow 
        title="140+"
        playerAValue= {playerAStats.plus140}
        playerBValue= {playerBStats.plus140}
      />
      <StatsRow 
        title="180"
        playerAValue= {playerAStats.max}
        playerBValue= {playerBStats.max}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4
  },
  darkRow: {
    backgroundColor: 'rgba(0,0,0,.3)',
    borderBottomWidth: 1,
    borderBottomColor: '#dc8418'
  },
  lightRow: {
    backgroundColor: 'rgba(0,0,0,.2)',
    borderBottomWidth: .5,
    borderBottomColor: '#bd7013'
  },
  leftRowSide: {
    flex: 1
  },
  rightRowSide: {
    flexDirection: 'row',
    flex: 1
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: '#f5f5f5',
    fontSize: 16
  },
  title: {
    color: '#f5f5f5',
    fontSize: 16
  },
  text: {
    flex: 1,
    textAlign: 'center',
    color: '#f5f5f5'
  }
});

export default Stats
