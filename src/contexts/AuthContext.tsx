import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  userName: string | null;
  logout: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  userName: null,
  logout: async () => {},
  setCurrentUser: () => {},
  setIsAdmin: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed. User:", user?.email);
      setCurrentUser(user);
      if (user) {
        const q = query(collection(db, 'teamMembers'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          
          const isAdminUser = userData?.role === 'admin';
          console.log("User document:", userData, "Is admin:", isAdminUser);
          setIsAdmin(isAdminUser);
          setUserName(userData?.name || null);
        } else {
          console.log("User document not found in Firestore");
          setIsAdmin(false);
          setUserName(null);
        }
      } else {
        setIsAdmin(false);
        setUserName(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdmin(false);
      setUserName(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    currentUser,
    isAdmin,
    userName,
    logout,
    setCurrentUser,
    setIsAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}