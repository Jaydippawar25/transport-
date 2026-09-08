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
  browserSessionPersistence
} from 'firebase/auth';

// Clear any legacy persistent storage keys
try {
  localStorage.removeItem('transtrack_user');
  localStorage.removeItem('user');
} catch (e) {}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if the current browser session is active
    const isSessionActive = sessionStorage.getItem('transtrack_active_session');

    if (isFirebaseConfigured && auth) {
      setLoading(true);

      // If browser was closed and reopened, sessionStorage was wiped.
      // Force sign-out of any residual Firebase IndexedDB local session.
      if (!isSessionActive) {
        firebaseSignOut(auth).catch(() => {});
        setCurrentUser(null);
        setLoading(false);
      } else {
        setPersistence(auth, browserSessionPersistence).catch(() => {});
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        const stillActive = sessionStorage.getItem('transtrack_active_session');
        if (user && stillActive) {
          const userObj = { uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0] };
          setCurrentUser(userObj);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    }
  }, []);

  const login = async (email, password) => {
    // Mark session as active for the lifetime of this browser session
    sessionStorage.setItem('transtrack_active_session', 'true');

    if (isFirebaseConfigured && auth) {
      try {
        await setPersistence(auth, browserSessionPersistence);
      } catch (e) {
        console.warn('Could not set browserSessionPersistence:', e);
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
    sessionStorage.removeItem('transtrack_active_session');
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading, isFirebaseConfigured }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
