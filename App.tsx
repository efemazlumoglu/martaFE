/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useContext} from 'react';
import {Text} from 'react-native';
import {AuthContext} from './src/context/AuthContext';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import LoginScreen from './src/screens/LoginScreen';

function App(): React.JSX.Element {
  const {currentUser} = useContext(AuthContext);
  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {currentUser ? (
          // <Stack.Screen name="MainStack" component={MainStack} />
          <Text>There is no user</Text>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            {/* <Stack.Screen name="Register" component={RegisterScreen} /> */}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

