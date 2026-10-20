import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  isFirebaseConfigured 
} from '../firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      // Set persistence to local so multi-tab usage is seamless
      setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn("Could not set auth persistence:", err);
      });

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          const userObj = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || user.email.split('@')[0]
          };
          setCurrentUser(userObj);
          localStorage.setItem('transtrack_active_session', 'true');
        } else {
          setCurrentUser(null);
          localStorage.removeItem('transtrack_active_session');
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Demo / Local Fallback Mode
      const isSessionActive = localStorage.getItem('transtrack_active_session') || sessionStorage.getItem('transtrack_active_session');
      if (isSessionActive) {
        setCurrentUser({
          uid: 'demo-staff-123',
          email: 'admin@123.com',
          name: 'Godown Operator / Admin'
        });
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    localStorage.setItem('transtrack_active_session', 'true');
    sessionStorage.setItem('transtrack_active_session', 'true');

    if (isFirebaseConfigured && auth) {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn('Could not set browserLocalPersistence:', e);
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userObj = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userCredential.user.displayName || userCredential.user.email.split('@')[0]
      };
      setCurrentUser(userObj);
      return userObj;
    } else {
      const demoUser = {
        uid: 'demo-staff-123',
        email: email || 'admin@123.com',
        name: 'Godown Operator / Admin'
      };
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  const logout = async () => {
    localStorage.removeItem('transtrack_active_session');
    sessionStorage.removeItem('transtrack_active_session');
    if (isFirebaseConfigured && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (err) {
        console.warn("Sign out error:", err);
      }
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, isFirebaseConfigured }}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
