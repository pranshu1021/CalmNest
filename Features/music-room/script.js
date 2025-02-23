import { db, collection, doc, setDoc, getDoc, updateDoc, onSnapshot, arrayUnion } from "./firebase.js";

let username = "";
let currentRoomId = "";
let isHost = false;
let currentPlayingSong = "";  // 🔥 New variable to store the currently playing song
let player;

const API_KEY = "AIzaSyDKVSSRYSJ0NOgXwPoUuxuwDBzezUCVR08";  

// 🎵 **YouTube Player API Setup**
function loadYouTubeAPI() {
    let tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    let firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player("music-player", {
        events: { "onReady": () => console.log("YouTube Player is ready!") }
    });
}

loadYouTubeAPI();

// 📌 **UI Elements**
const usernamePopup = document.getElementById("username-popup");
const usernameInput = document.getElementById("username-input");
const setUsernameBtn = document.getElementById("set-username-btn");
const mainContainer = document.getElementById("main-container");
const userDisplay = document.getElementById("user-display");
const createRoomBtn = document.getElementById("create-room-btn");
const joinRoomBtn = document.getElementById("join-room-btn");
const roomIdInput = document.getElementById("room-id-input");
const roomIdDisplay = document.getElementById("room-id-display");
const membersList = document.getElementById("members-list");
const songInput = document.getElementById("song-input");
const searchSongBtn = document.getElementById("search-song-btn");
const searchResults = document.getElementById("search-results");
const playSongBtn = document.getElementById("play-song-btn");
const pauseSongBtn = document.getElementById("pause-song-btn");
const messagesContainer = document.getElementById("messages");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message-btn");

// ✅ **Set Username**
setUsernameBtn.onclick = () => {
    username = usernameInput.value.trim();
    if (username !== "") {
        localStorage.setItem("username", username);
        usernamePopup.style.display = "none";
        mainContainer.style.display = "block";
        userDisplay.innerText = `Welcome, ${username}`;
    }
};

// ✅ **Create Room**
createRoomBtn.onclick = async () => {
    currentRoomId = Math.random().toString(36).substring(2, 8);
    await setDoc(doc(db, "rooms", currentRoomId), {
        members: [username],
        host: username,
        currentSong: "",
        isPlaying: false,
        chatMessages: []
    });
    isHost = true;
    joinRoom(currentRoomId);
};

// ✅ **Join Room**
const joinRoom = async (roomId) => {
    currentRoomId = roomId;
    roomIdDisplay.innerText = `Room ID: ${currentRoomId}`;
    
    const roomRef = doc(db, "rooms", currentRoomId);
    const roomSnap = await getDoc(roomRef);

    if (roomSnap.exists()) {
        await updateDoc(roomRef, { members: arrayUnion(username) });
        isHost = (roomSnap.data().host === username);
        
        // **Show Members in Room**
        onSnapshot(roomRef, (snapshot) => {
            const data = snapshot.data();
            membersList.innerHTML = data.members.map(member =>
                `<li class="${data.host === member ? 'host' : ''}">${member}</li>`).join('');

            // 🔥 **FIX: Video will only play if a NEW song is set**
            if (data.currentSong && data.currentSong !== currentPlayingSong) {
                playSong(data.currentSong, false);
            }
            
            // 🔥 **FIX: Only update pause/play if needed**
            if (data.isPlaying && player && player.getPlayerState() !== 1) {
                player.playVideo();
            } else if (!data.isPlaying && player && player.getPlayerState() !== 2) {
                player.pauseVideo();
            }
        });

        // ✅ **Start Listening to Chat Messages Separately**
        listenToMessages();
    } else {
        alert("Room not found!");
    }
};

// ✅ **Join Room Button Click**
joinRoomBtn.onclick = async () => {
    const roomId = roomIdInput.value.trim();
    if (roomId !== "") {
        await joinRoom(roomId);
    }
};

// ✅ **Search Songs**
searchSongBtn.onclick = async () => {
    try {
        let response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${songInput.value}&key=${API_KEY}&type=video&maxResults=5`);
        let data = await response.json();

        if (data.items) {
            searchResults.innerHTML = data.items.map(video =>
                `<button onclick="playSong('${video.id.videoId}', true)">${video.snippet.title}</button>`).join('');
        } else {
            searchResults.innerHTML = "<p>No results found.</p>";
        }
    } catch (error) {
        console.error("Error fetching YouTube data:", error);
        searchResults.innerHTML = "<p>Failed to load results.</p>";
    }
};

// ✅ **Play Song (SYNCED ACROSS USERS)**
window.playSong = async (videoId, updateFirestore = true) => {
    if (videoId === currentPlayingSong) return;  // 🔥 **FIX: Prevent duplicate loads**
    
    currentPlayingSong = videoId;

    if (player) {
        player.loadVideoById(videoId);
    } else {
        document.getElementById("music-player").src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    }

    if (updateFirestore) {
        await updateDoc(doc(db, "rooms", currentRoomId), {
            currentSong: videoId,
            isPlaying: true
        });
    }
};

// ✅ **Play/Pause Buttons (SYNCED)**
playSongBtn.onclick = async () => {
    if (isHost && player) {
        player.playVideo();
        await updateDoc(doc(db, "rooms", currentRoomId), { isPlaying: true });
    }
};

pauseSongBtn.onclick = async () => {
    if (isHost && player) {
        player.pauseVideo();
        await updateDoc(doc(db, "rooms", currentRoomId), { isPlaying: false });
    }
};

// ✅ **Send Message to Firestore**
sendMessageBtn.onclick = async () => {
    const messageText = messageInput.value.trim();
    if (messageText === "") return;

    const roomRef = doc(db, "rooms", currentRoomId);
    await updateDoc(roomRef, {
        chatMessages: arrayUnion({ user: username, text: messageText, timestamp: Date.now() })
    });

    messageInput.value = "";
};

// ✅ **Listen for New Messages (Separate Listener)**
const listenToMessages = () => {
    onSnapshot(doc(db, "rooms", currentRoomId), (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            messagesContainer.innerHTML = data.chatMessages?.map(({ user, text }) =>
                `<div class="message ${user === username ? 'sent' : 'received'}">${user}: ${text}</div>`).join('');
            
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    });
};
