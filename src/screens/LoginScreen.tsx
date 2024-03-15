import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {auth} from '../libs/firebase';
import {signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {FirebaseError} from 'firebase/app';
import {AuthContext} from '../context/AuthContext';

const Login = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const isEmailValid = (email: string) => {
    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errHandler, setErrHandler] = useState({
    isError: false,
    errorMsg: '',
  });

  const FIREBASE_ERRORS = {
    'auth/email-already-in-use': 'A user with that email already exists',
    'auth/weak-password':
      'Please check your password. It should be 6+ characters',
    'auth/user-not-found': 'Invalid email or password',
    'auth/wrong-password': 'Invalid email or password',
    'auth/invalid-credential': 'Invalid credentials please register',
  };

  const {currentUser} = useContext(AuthContext);
  if (currentUser) {
    // return <Navigate to="" />;
  }

  const handleLogin = async () => {
    if (!isEmailValid(email)) {
      setEmailError('Invalid email');
      return;
    } else {
      setEmailError('');
    }

    // Validate password
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    } else {
      setPasswordError('');
    }

    try {
      await signOut(auth);
      setIsLoading(true);
      setErrHandler({isError: false, errorMsg: ''});
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredential.user) {
        setIsLoading(false);
        //TODO: store the uid of user for upcoming transactions
      }
    } catch (error: unknown) {
      const err = error as FirebaseError;
      console.log(err.code);
      setErrHandler({
        isError: true,
        errorMsg: FIREBASE_ERRORS[err.code as keyof typeof FIREBASE_ERRORS],
      });
      Alert.alert(
        'Login Failed',
        FIREBASE_ERRORS[err.code as keyof typeof FIREBASE_ERRORS],
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.eyeIcon}>
          <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
      {passwordError ? (
        <Text style={styles.errorText}>{passwordError}</Text>
      ) : null}
      <TouchableOpacity
        style={[
          styles.button,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            backgroundColor:
              isEmailValid(email) && password.length >= 6
                ? '#4CAF50'
                : '#CCCCCC',
          },
        ]}
        disabled={!isEmailValid(email) || password.length < 8}
        onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <Text style={styles.warningText}>
        Please enter a valid email and password should be at least 8 characters.
      </Text>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Don't you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 5,
  },
  warningText: {
    marginTop: 5,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderRadius: 5,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default Login;
