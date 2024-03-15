import {User, onAuthStateChanged} from 'firebase/auth';
import React, {createContext, useEffect, useState} from 'react';
import {auth} from '../libs/firebase';

type InitialState = {
  currentUser: User | null;
};
export const AuthContext = createContext<InitialState>({currentUser: null});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        console.log(user);
        setCurrentUser(user);
      } else {
        console.log('user is coming null');
        setCurrentUser(null);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <AuthContext.Provider value={{currentUser}}>
      {children}
    </AuthContext.Provider>
  );
};
