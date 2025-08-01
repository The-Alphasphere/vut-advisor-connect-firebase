// src/hooks/useAuth.tsx

import React, { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from '../lib/firebase'; // Import from your new file
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Define the shape of our user profile
interface UserProfile {
  uuid: string;
  Name: string;
  Surname: string;
  email: string;
  role: 'student' | 'advisor' | 'admin';
}

// Define the shape of the context.
interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  logout: () => void;
}

// Create the context with a default value. This is a more robust pattern.
const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // User is logged in, now fetch their profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userProfile: UserProfile = {
            uuid: firebaseUser.uid,
            Name: userDoc.data().Name,
            Surname: userDoc.data().Surname,
            email: userDoc.data().email,
            role: userDoc.data().role
          };
          setUser(userProfile);
        } else {
            // User exists in Auth but not in Firestore. Handle this error case.
            await signOut(auth); // Sign out the user to prevent an inconsistent state
            setUser(null);
        }
      } else {
        // No user is logged in
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;

      // 2. Fetch profile from Firestore to get the role
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await signOut(auth); // Sign out if no profile exists
        return { success: false, error: 'User profile not found.' };
      }
      
      const userProfile: UserProfile = {
        uuid: firebaseUser.uid,
        Name: userDoc.data().Name,
        Surname: userDoc.data().Surname,
        email: userDoc.data().email,
        role: userDoc.data().role,
      };

      setUser(userProfile);
      setLoading(false);
      return { success: true, user: userProfile };

    } catch (error: any) {
      setLoading(false);
      // Handle Firebase auth errors (e.g., wrong password)
      return { success: false, error: "Invalid email or password provided." };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };
  
  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};