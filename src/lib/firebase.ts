import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAN6OFKvq01siQM1sQbTICDXcA4s3J-pZ4",
  authDomain: "vut-advisor-connect-test-login.firebaseapp.com",
  projectId: "vut-advisor-connect-test-login",
  storageBucket: "vut-advisor-connect-test-login.firebasestorage.app",
  messagingSenderId: "533411034265",
  appId: "1:533411034265:web:d481e45b7737c7141d7408"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;