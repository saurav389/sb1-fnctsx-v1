import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD3qzkXZES-jSjbw8fgini0du_PnC8W9b8",
  authDomain: "projectmanagement-9972f.firebaseapp.com",
  projectId: "projectmanagement-9972f",
  storageBucket: "projectmanagement-9972f.appspot.com",
  messagingSenderId: "1087802698816",
  appId: "1:1087802698816:web:764faa07cfec870f4703a5",
  measurementId: "G-2N2S2KZQQJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);