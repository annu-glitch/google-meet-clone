# Google Meet Clone

A real-time video conferencing web application inspired by Google Meet. Built using **Node.js**, **Socket.IO**, and **WebRTC**, this clone allows users to create and join meetings with live video, audio, chat, and screen sharing features.

---

## 🚀 Features

- 🔐 Create or join secure meeting rooms
- 📹 Real-time video and audio communication (WebRTC)
- 🧑‍🤝‍🧑 Show participant list and dynamic user joining/leaving
- 💬 Real-time chat
- 🎤 Mute/Unmute audio
- 🎥 Start/Stop video
- 📱 Responsive design (mobile + desktop)
- 🔒 Uses HTTPS server for secure communication

---

## 📁 Folder Structure

google_meet_clone/
│
├── .vscode/ # VS Code settings (optional)
├── node_modules/ # NPM dependencies
├── public/ # Static assets (JS/CSS used by HTML files)
├── action.html # Meeting room action page
├── index.html # Homepage for entering username & meeting ID
├── server.js # Backend server (Node + Express + HTTPS + Socket.IO)
├── cert.pem # SSL certificate (for HTTPS)
├── key.pem # SSL private key
├── package.json # Project metadata and dependencies
├── package-lock.json # Dependency lock file
└── README.md # Project documentation

-----------------------------------------------------------------------------------------------------------

2. Install dependencies
   npm install

 ----------------------------------------------------------------------------------------------------------  
   
4. Create SSL certificates (for HTTPS)
   openssl req -nodes -new -x509 -keyout key.pem -out cert.pem
   Or you can use the existing key.pem and cert.pem files for local testing.
-----------------------------------------------------------------------------------------------------

5. Start the server
   npm start
   
   App will run on:
🟢 https://localhost:3000 (main)
🔵 http://localhost:3001 (fallback / non-secure HTTP)

-----------------------------------------------------------------------------------------------------------------

🛠 Tech Stack
Frontend: HTML, JavaScript

Backend: Node.js, Express

Real-time Communication: WebRTC, Socket.IO

Security: HTTPS with self-signed SSL

-----------------------------------------------------------------------------------------------------------------

📸 Screenshots

![Screenshot 2025-05-06 132330](https://github.com/user-attachments/assets/da2b15fb-0e76-4c16-b823-ed769d396849)

![Screenshot 2025-05-06 132449](https://github.com/user-attachments/assets/edea60dd-2466-4537-bcf7-f996e79d19b5)

![Screenshot 2025-05-06 132520](https://github.com/user-attachments/assets/c9e9889b-2048-4b07-903a-4a8b3cd83889)








