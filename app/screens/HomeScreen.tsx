// screens/HomeScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [channelId, setChannelId] = useState('');
  const [connectionType, setConnectionType] = useState('Public');
  const [password, setPassword] = useState('');

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  }, []);

  const handleConnect = async () => {
    // Missing fields logic
    if (!channelId) {
      Alert.alert('Error', 'Please enter a Channel ID.', [{ text: 'OK' }]);
      return;
    }
    if (connectionType === 'Private' && !password) {
      Alert.alert('Error', 'Please enter a Password for the Private connection.', [{ text: 'OK' }]);
      return;
    }

    try {
      const apiUrl = `https://api.thingspeak.com/channels/${channelId}/feeds.json`;
      const params = connectionType === 'Private' ? `?api_key=${password}` : '';

      const response = await fetch(apiUrl + params);
      const data = await response.json();
      const res = {data, channelId, password}
      if (response.ok) {
        Alert.alert('Success', 'Connected successfully!', [{ text: 'OK', onPress: () => handleNavigation(res) }]);
        navigation.navigate('ControlPanel', res);
      } else {
        Alert.alert('Error', data.error || 'Connection failed. Check your channel ID or password.', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.', [{ text: 'OK' }]);
    }
  };

  const handleNavigation = (data) => {
    if (Platform.OS === 'web') {
      window.location.href = '/ControlPanel'; 
    } else {
      navigation.navigate('ControlPanel', { data });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>EcoViewer</Text>
      <TextInput
        style={styles.input}
        placeholder="Channel ID"
        placeholderTextColor="#aaa"
        value={channelId}
        onChangeText={setChannelId}
      />
      <Text style={styles.label}>Connection Type</Text>
      <Picker
        selectedValue={connectionType}
        style={styles.picker}
        onValueChange={(itemValue) => {
          setConnectionType(itemValue);
          if (itemValue === 'Public') {
            setPassword('');
          }
        }}
      >
        <Picker.Item label="Public" value="Public" />
        <Picker.Item label="Private" value="Private" />
      </Picker>
      {connectionType === 'Private' && (
        <TextInput
          style={[styles.input, styles.passwordInput]}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Connect" onPress={handleConnect} color="orange" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  title: {
    fontSize: 32,
    color: '#ff4500',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ff4500',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#fff',
  },
  passwordInput: {
    marginTop: 15,
  },
  label: {
    color: 'white',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#ff4500',
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: '#333',
    color: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});

export default HomeScreen;
