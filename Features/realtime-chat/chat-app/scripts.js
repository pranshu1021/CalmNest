const socket = io("http://localhost:3000"); // Connect to server
let username = "";

// Function to set username
function setUsername() {
    username = document.getElementById("username").value;
    if (username.trim() === "") {
        alert("Please enter a username! or you'll be nameless.");
        return;
    }
    socket.emit("newUser", username);
}

// Receive and display messages
socket.on("chatMessage", (data) => {
    console.log("📩 New Message:", data);

    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("p");
    
    // Format: [username]: message
    newMessage.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    
    chatBox.appendChild(newMessage);

    // Auto-scroll to latest message
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Notify when a user joins
socket.on("userJoined", (name) => {
    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("p");
    newMessage.textContent = `🔹 ${name} joined the chat`;
    newMessage.style.color = "green";
    chatBox.appendChild(newMessage);
});

// Notify when a user leaves
socket.on("userLeft", (name) => {
    const chatBox = document.getElementById("chat-box");
    const newMessage = document.createElement("p");
    newMessage.textContent = `❌ ${name} left the chat`;
    newMessage.style.fontStyle = "italic";
    newMessage.style.color = "red";
   
    chatBox.appendChild(newMessage);
});
// enter dabane se send button click hojaye
document.addEventListener("keydown",function(event){
    if(event.key ==="Enter"){
        event.preventDefault();
        document.getElementById("send-button").click();
        
    }
});
// Send message function
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();

    if (message !== "") {
        socket.emit("chatMessage", message); // Send message to server
        messageInput.value = ""; // Clear input
    }
}
