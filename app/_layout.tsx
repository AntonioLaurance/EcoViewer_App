import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import controlPanel from './screens/ControlPanel';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ControlPanel" component={controlPanel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
