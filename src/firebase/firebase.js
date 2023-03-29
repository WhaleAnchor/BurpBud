// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
  doc,
  setDoc,
  limit,
  orderBy,
} from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAzjbyZ00Qc_zUKwjFu1c5D1QeWP1zBAfI",
    authDomain: "burp-logs.firebaseapp.com",
    projectId: "burp-logs",
    storageBucket: "burp-logs.appspot.com",
    messagingSenderId: "514716782069",
    appId: "1:514716782069:web:f3024c4dbca017dd55e4bc",
    measurementId: "G-LD1ZHC580V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google authentication
const googleProvider = new GoogleAuthProvider();
const signInWithGoogle = async () => {
    try {
        const res = await signInWithPopup(auth, googleProvider);
        const user = res.user;
        const q = query(collection(db, "users"), where("uid", "==", user.uid));
        const docs = await getDocs(q);
        if (docs.docs.length === 0) {
            await addDoc(collection(db, "users"), {
            uid: user.uid,
            name: user.displayName,
            authProvider: "google",
            email: user.email,
            });

            // Create a document for the user using their UID
            await setDoc(doc(db, "user_collections", user.uid), {
              uid: user.uid,
            });
          }
        } catch (err) {
          console.error(err);
          alert(err.message);
    };
};

// Email and Password authentication for signing in
const logInWithEmailAndPassword = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
};

// Email and password registering
const registerWithEmailAndPassword = async (name, email, password) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name,
        authProvider: "local",
        email,
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
};

// Password reset for email
const sendPasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
};

// Logout function
const logout = () => {
    signOut(auth);
};

// functions for logging burps
const addBurpLog = async (uid, newBurpTime, newBurpCount, newBurpDate, newBurpComment) => {
    try {
        // Access the user's unique "burpLogs" collection
        const burpLogsCollection = collection(db, "user_collections", uid, "burpLogs");
  
        // Add a new document with the given data to the "burpLogs" collection
        await addDoc(burpLogsCollection, {
            burpTime: newBurpTime,
            burpCount: newBurpCount,
            burpDate: newBurpDate,
            burpComment: newBurpComment,
        });
        console.log("Successfully logged")
  
    } catch (err) {
        console.error(err);
        alert(err.message);
    };
};


// function exports
export {
  auth,
  db,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  addBurpLog,
  getLastBurpLog,
};