import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3000");

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  // STEP-3
  // Send message to server
  const sendMessage = () => {
    if (message.trim() && room.trim()) {
      socket.emit("send_message", { room, message });
      setMessage(""); // Clear message input after sending
      socket.emit("stop_typing", room); // Emit stop_typing event
    }
  };

  // STEP-1
  const joinRoom = () => {
    if (room.trim() && username.trim()) {
      socket.emit("join_room", { username, room });
    }
  };

  const handleRoomChange = (e) => {
    setRoom(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", room);
    }

    // Debounce stop typing event
    clearTimeout(window.typingTimer);
    window.typingTimer = setTimeout(() => {
      setTyping(false);
      socket.emit("stop_typing", room);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
   let pre=   setMessages((prevMessages) => [...prevMessages, ...data]);
      console.log(pre,"popop")
    });

    socket.on("typing", (username) => {
      setTypingUser(username);
      setIsTyping(true);
    });

    socket.on("stop_typing", () => {
      setIsTyping(false);
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, []);

  return (
    <div className="App">
      <div className="chat-container">
        <div className="header">
          <h1>Chat APP</h1>
        </div>
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.sender === username ? "sent" : "received"}`}
            >
              <div>{msg.message}</div>
              <div className="timestamp">{msg.timestamp}</div>
            </div>
          ))}
          {isTyping && <div className="message typing">{typingUser} is typing...</div>}
        </div>

        
        <div className="input-container">
          <input
            type="text"
            placeholder="Username..."
            value={username}
            onChange={handleUsernameChange}
          />
          <input
            type="text"
            placeholder="Room Number..."
            value={room}
            onChange={handleRoomChange}
          />
          <button onClick={joinRoom}>Join Room</button>
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            placeholder="Type your message..."
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
