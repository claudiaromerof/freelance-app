/* =========================================================
   CRF — FIREBASE CORE
   Authentication + Firestore
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByLYQ6g8LbKduhwQymBqIPGp3mnzP_pCE",
  authDomain: "crf-freelance.firebaseapp.com",
  projectId: "crf-freelance",
  storageBucket: "crf-freelance.firebasestorage.app",
  messagingSenderId: "753347981033",
  appId: "1:753347981033:web:fea970ca276625ea458a78"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

async function logoutFirebase() {
  await signOut(auth);
}

function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export {
  firebaseApp,
  auth,
  db,
  googleProvider,
  loginWithGoogle,
  logoutFirebase,
  watchAuth
};
