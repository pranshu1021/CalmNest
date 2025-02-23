import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDGBpchBzHl03HUeUrtrcHrLLzWd-QC_II",
    authDomain: "calmnest-4b727.firebaseapp.com",
    projectId: "calmnest-4b727",
    storageBucket: "calmnest-4b727.appspot.com",
    messagingSenderId: "407039391755",
    appId: "1:407039391755:web:df9578cfd4a24ed1fc6f0e",
    measurementId: "G-ZQME5PDLB4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove };
