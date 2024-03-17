/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext, useEffect, useState} from 'react';
import {Alert, View, Text} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import TaskListScreen from './src/screens/TaskListScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import NetInfo from '@react-native-community/netinfo';

function App({navigation}): React.JSX.Element {
  const [user, setUser] = useState(false);
  const getItemFromStorage = async () => {
    try {
      const uid = await AsyncStorage.getItem('uid');
      if (uid !== null) {
        console.log('UID retrieved:', uid);
        setUser(true);
      } else {
        console.log('No UID found in AsyncStorage');
        setUser(false);
      }
    } catch (error) {
      console.error('Error retrieving data from async storage');
      setUser(false);
    }
  };
  useEffect(() => {
    getItemFromStorage();
  });

  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{text: 'OK'}],
        {cancelable: false},
      );
    }
  }, [isConnected]);

  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{
                title: 'Task List',
              }}
            />
            <Stack.Screen
              name="AddTask"
              component={AddTaskScreen}
              options={{
                title: 'Add Task',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
