import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
// @ts-ignore
import { getReactNativePersistence } from "@firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyANrzO0bwbfGXzBfC59b1tjSwhurPe7L00",
  authDomain: "orbitapp-8107f.firebaseapp.com",
  projectId: "orbitapp-8107f",
  storageBucket: "orbitapp-8107f.firebasestorage.app",
  messagingSenderId: "554912152562",
  appId: "1:554912152562:web:70bc00b44fbabf06b0496b",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
