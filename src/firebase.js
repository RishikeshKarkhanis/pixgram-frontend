// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGELGBiNpwa-XPeCqFh_6UCIL2a_dwUlY",
  authDomain: "pixgram-469807.firebaseapp.com",
  projectId: "pixgram-469807",
  storageBucket: "pixgram-469807.firebasestorage.app",
  messagingSenderId: "724605495978",
  appId: "1:724605495978:web:2eeb49d8d5a77463d97ed3",
  measurementId: "G-2H46J6S53H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };