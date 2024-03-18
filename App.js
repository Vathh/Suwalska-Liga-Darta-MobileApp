import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Home from './components/Home';
import Match from './components/Match';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style='light'/>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={Home}
            options={{
              title: 'Suwalska Liga Darta',
              headerStyle: {
                backgroundColor: '#363062',
              },
              headerTintColor: '#F99417',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen name="Match" component={Match}
            options={{
              title: 'Suwalska Liga Darta',
              headerStyle: {
                backgroundColor: '#363062',
              },
              headerTintColor: '#F99417',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}


