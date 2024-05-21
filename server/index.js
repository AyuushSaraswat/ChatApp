// Setup Express Server and Socket.IO

const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// --------------X---------------

// Define Routes:-

app.get("/", (req, res) => {
  res.send("Hello World");
});

// --------------X---------------

let messages = {}; // Object to store messages by room

// Handle Socket.IO Events:--

// Handle User Connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

 // STEP-2
// Handle Joining a Room
   socket.on("join_room", ({ room, username }) => {
    socket.join(room);
    socket.username = username; // Store username in socket instance
    console.log(socket.username)
     if(socket.username == username){
    }
    else{
      if (messages[room]) {
        socket.emit("receive_message", messages[room]);
      }
    }
    console.log(`User ${username} joined room ${room}`);   
  });

   // STEP-4
  // Message Recieved from Client 
    socket.on("send_message", (data) => {
    const { room, message } = data;

    // Add the new message to the array for the room 
    if (!messages[room]) {
      messages[room] = [];
    }
    const messageData = { 
      message, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: socket.username 
    };
    console.log(messageData)
    messages[room].push(messageData);

    // Broadcast the new message to the room
    io.to(room).emit("receive_message", [messageData]); // Wrap messageData in an array
  });

  socket.on("typing", (room) => {
    socket.to(room).emit("typing", socket.username);
  });

  socket.on("stop_typing", (room) => {
    socket.to(room).emit("stop_typing", socket.username);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ----------------------X------------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
