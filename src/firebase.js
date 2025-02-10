import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

export const firestore = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage(); // Export the 'storage' module

// Add sidebar configuration collection reference
export const sidebarConfigRef = firestore.collection('sidebarConfig');

// Helper function to check if user is super admin
export const checkSuperAdmin = async (uid) => {
  if (!uid) return false;
  try {
    const userDoc = await firestore.collection('users').doc(uid).get();
    return userDoc.exists && userDoc.data().role === 'superadmin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export default firebase;
