import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCR8yWbCeLDNT6TcWhQRD7zUBg4F9Uwi6s',
  authDomain: 'martatodotask.firebaseapp.com',
  databaseURL: 'https://martatodotask-default-rtdb.firebaseio.com',
  projectId: 'martatodotask',
  storageBucket: 'martatodotask.appspot.com',
  messagingSenderId: '566524294971',
  appId: '1:566524294971:web:ba2ea8400f31623950291e',
  measurementId: 'G-2GG5K0B9VW',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
