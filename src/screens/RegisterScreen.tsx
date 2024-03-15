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
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {FirebaseError} from 'firebase/app';
import {AuthContext} from '../context/AuthContext';

const RegisterScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmShowPassword(!showConfirmPassword);
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

  const handleRegister = async () => {
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

    if (password !== confirmPassword) {
      setPasswordError('Passwords should match with each other');
      return;
    } else {
      setPasswordError('');
    }

    try {
      await signOut(auth);
      setIsLoading(true);
      setErrHandler({isError: false, errorMsg: ''});
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (userCredential.user) {
        console.log(userCredential.user);
        setIsLoading(false);
        console.log('Register Success');
        Alert.alert('Register Success', 'Please Login');
        navigation.navigate('Login');
      }
    } catch (error: unknown) {
      const err = error as FirebaseError;
      console.log(err.code);
      setErrHandler({
        isError: true,
        errorMsg: FIREBASE_ERRORS[err.code as keyof typeof FIREBASE_ERRORS],
      });
      Alert.alert(
        'Register Failed',
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
      <Text style={styles.label}>Confirm Password</Text>
      <View style={styles.passwordInputContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Confirm your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity
          onPress={toggleConfirmPasswordVisibility}
          style={styles.eyeIcon}>
          <Text>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
        </TouchableOpacity>
      </View>
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
        onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
      <Text style={styles.warningText}>
        Please enter a valid email and password should be at least 8 characters.
      </Text>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>Do you have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.registerText}>Login</Text>
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

export default RegisterScreen;
