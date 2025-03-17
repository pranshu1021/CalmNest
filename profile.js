// 🔥 Firebase SDK Import
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔹 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDGBpchBzHl03HUeUrtrcHrLLzWd-QC_II",
    authDomain: "calmnest-4b727.firebaseapp.com",
    projectId: "calmnest-4b727",
    storageBucket: "calmnest-4b727.appspot.com",
    messagingSenderId: "407039391755",
    appId: "1:407039391755:web:df9578cfd4a24ed1fc6f0e"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Function to Load Profile Info Dynamically
onAuthStateChanged(auth, (user) => {
    if (user) {
        // 🔹 Create Profile Container if it Doesn't Exist
        if (!document.getElementById("profile-container")) {
            document.body.insertAdjacentHTML(
                "beforeend",
                `<div id="profile-container" class="profile-container">
                    <div class="profile-card">
                        <img src="${user.photoURL || './img/default-avatar.png'}" alt="Profile Picture" class="profile-pic">
                        <p class="profile-name">${user.displayName || "User"}</p>
                        <button id="logout-btn">Logout</button>
                    </div>
                </div>`
            );
        }

        // 🔹 Add Logout Functionality
        document.getElementById("logout-btn").addEventListener("click", async () => {
            await signOut(auth);
            window.location.reload();
        });
    }
});
