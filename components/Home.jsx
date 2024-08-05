import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { AUTHENTICATE_API_URL } from '../helpers/apiConfig';
import useAuth from '../hooks/useAuth';

const Home = () => {

  const { setAuth } = useAuth();

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userDTO = {
        userName: userName,
        password: password
      }

      const response = await fetch(AUTHENTICATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
        body: JSON.stringify(userDTO)
      });
      let data = await response.json();
      
      const accessToken = data?.accessToken;
      const role = data?.role;

      setAuth({ userName, role, accessToken });
      setUserName('');
      setPassword('');    
    } catch (err) {
      if(!err?.response){
        setErrorMsg('Nazwa użytkownika lub hasło jest nieprawidłowe');
      } else if(err.response?.status === 400){
        setErrorMsg('Missing Username or Password');
      } else if(err.response?.status === 401){
        setErrorMsg('Unauthorized');
      } else {
        setErrorMsg('Login Failed');
      }
    } 
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zaloguj się</Text>
      <View style={styles.form}>
        <Text style={styles.errorMessage}>{errorMsg}</Text>
        <TextInput 
          style={styles.input} 
          placeholder='Nazwa użytkownika' 
          value={userName} 
          onChangeText={text => setUserName(text)} 
          autoCorrect={false} 
          autoCapitalize='none'/>
        <TextInput 
          style={styles.input} 
          placeholder='Hasło' 
          value={password} 
          onChangeText={text => setPassword(text)} 
          autoCorrect={false} 
          autoCapitalize='none'/>
        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Zaloguj</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#363062',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    color: '#c5c5c5',
    marginBottom: 70,
    marginTop: 100
  },
  form: {
    alignItems: 'center'
  },
  errorMessage: {
    fontSize: 14,
    color: '#ff1e1e',
    marginBottom: 20
  },
  input: {
    marginBottom: 20,
    color: '#363062',
    backgroundColor:  '#f5f5f5cc',
    borderRadius: 5,
    width: 200,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16
    },
  button: {
    alignItems: 'center',
    marginTop: 20,
    // marginHorizontal: 'auto',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor:  '#f5f5f5cc',
    borderRadius: 5
  },
  buttonText: {
    color: '#363062',
  }
})

export default Home
