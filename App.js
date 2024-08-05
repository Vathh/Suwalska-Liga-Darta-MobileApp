import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthProvider';
import Screens from './pages/Screens';

export default function App() {
  return (
    <>
      <StatusBar style='light'/>
      <NavigationContainer>
        <AuthProvider>
          <Screens />
        </AuthProvider>
      </NavigationContainer>
    </>
  );
}


