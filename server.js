const express = require("express");
const path = require("path");
const fs = require("fs");
const http = require("http");
const https = require("https");
const fileUpload = require("express-fileupload");
const socketIo = require("socket.io");

const app = express();

// Load your SSL certificate and key
const options = {
  key: fs.readFileSync(path.join(__dirname, 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
};

// Serve static files
app.use(express.static(path.join(__dirname, "")));

// Middleware for file uploads
app.use(fileUpload());

var userConnections = [];
var hostInfo = [];

// Create an HTTPS server
const httpsServer = https.createServer(options, app);
const io = socketIo(httpsServer, {
  allowEIO3: true, // false by default
});

io.on("connection", (socket) => {
  console.log("socket id is ", socket.id);

  async function userConnect(data) {
    console.log("from UserConnect");
    console.log("userconnent displayName", data.displayNames);
    console.log("userconnent meetingid", data.meetingids);
    console.log("userconnent connectionId", data.connectionIds);

    // Check if the user is already connected
    const existingUser = userConnections.find(
      (p) =>
        p.meeting_id === data.meetingids &&
        p.connectionId === data.connectionIds
    );

    if (!existingUser) {
      // Push the new user connection to userConnections
      userConnections.push({
        connectionId: data.connectionIds,
        user_id: data.displayNames,
        meeting_id: data.meetingids,
      });

      // Update other_users based on the latest userConnections
      var other_users = userConnections.filter(
        (p) =>
          p.meeting_id == data.meetingids &&
          p.connectionId !== data.connectionIds
      );

      // Declare userCount and get its value
      var userCount = userConnections.length;
      console.log(userCount);

      console.log("other_users length before forEach:", other_users.length);

      // Inform the newly joined user about others
      socket
        .to(data.connectionIds)
        .emit("inform_me_about_other_user", other_users);

      // Inform others about the newly joined user
      other_users.forEach((v) => {
        console.log("Inside forEach");
        console.log("data:", data);
        console.log("v:", v);
        try {
          io.to(v.connectionId).emit("inform_others_about_me", {
            other_user_id: data.displayNames,
            connId: data.connectionIds,
            userNumber: userCount,
          });
        } catch (error) {
          console.error("Error in emit:", error);
        }
      });
    }
  }

  socket.on("askToConnect", (data) => {
    const isMeetingExist = userConnections.find(
      (info) => info.meeting_id === data.meetingid
    );
    if (isMeetingExist) {
      const isHostForMeeting = hostInfo.find(
        (info) => info.meeting_id === data.meetingid
      );
      socket.to(isHostForMeeting.connectionId).emit("request_join_permission", {
        displayNames: data.displayName,
        meetingids: data.meetingid,
        connectionIds: socket.id,
      });
    } else {
      hostInfo.push({
        connectionId: socket.id,
        user_id: data.displayName,
        meeting_id: data.meetingid,
        host: true,
      });
      var datt = {
        displayNames: data.displayName,
        meetingids: data.meetingid,
        connectionIds: socket.id,
        host: true,
      };
      try {
        userConnect(datt);
      } catch (error) {
        console.log("error is ", error);
      }
    }
  });

  socket.on("grant_join_permission", (dat) => {
    console.log("data permission is: ", dat);

    if (dat.permissionGranted) {
      try {
        userConnect(dat.data);
        socket.to(dat.data.connectionId).emit("let_user_connect", dat.data);
      } catch (error) {
        console.error("Error connecting user:", error);
        socket.to(dat.data.connectionId).emit("connection_error", { message: "Failed to connect user." });
      }
    } else {
      socket.to(dat.data.connectionId).emit("permission_denied");
    }
  });

  socket.on("SDPProcess", (data) => {
    socket.to(data.to_connid).emit("SDPProcess", {
      message: data.message,
      from_connid: socket.id,
    });
  });

  socket.on("sendMessage", (msg) => {
    console.log(msg);
    var mUser = userConnections.find((p) => p.connectionId == socket.id);
    if (mUser) {
      var meetingid = mUser.meeting_id;
      var from = mUser.user_id;
      var list = userConnections.filter((p) => p.meeting_id == meetingid);
      list.forEach((v) => {
        socket.to(v.connectionId).emit("showChatMessage", {
          from: from,
          message: msg,
        });
      });
    }
  });

  socket.on("fileTransferToOther", (msg) => {
    console.log(msg);
    var mUser = userConnections.find((p) => p.connectionId == socket.id);
    if (mUser) {
      var meetingid = mUser.meeting_id;
      var from = mUser.user_id;
      var list = userConnections.filter((p) => p.meeting_id == meetingid);
      list.forEach((v) => {
        socket.to(v.connectionId).emit("showFileMessage", {
          username: msg.username,
          meetingid: msg.meetingid,
          filePath: msg.filePath,
          fileName: msg.fileName,
        });
      });
    }
  });

  socket.on("disconnect", function () {
    console.log("Disconnected");
    var disUser = userConnections.find((p) => p.connectionId == socket.id);
    if (disUser) {
      var meetingid = disUser.meeting_id;
      userConnections = userConnections.filter(
        (p) => p.connectionId != socket.id
      );
      var list = userConnections.filter((p) => p.meeting_id == meetingid);
      list.forEach((v) => {
        var userNumberAfUserLeave = userConnections.length;
        socket.to(v.connectionId).emit("inform_other_about_disconnected_user", {
          connId: socket.id,
          uNumber: userNumberAfUserLeave,
        });
      });
    }
  });

  socket.on("sendHandRaise", function (data) {
    var senderID = userConnections.find((p) => p.connectionId == socket.id);
    console.log("senderID :", senderID.meeting_id);
    if (senderID.meeting_id) {
      var meetingid = senderID.meeting_id;
      var list = userConnections.filter((p) => p.meeting_id == meetingid);
      list.forEach((v) => {
        var userNumberAfUserLeave = userConnections.length;
        socket.to(v.connectionId).emit("HandRaise_info_for_others", {
          connId: socket.id,
          handRaise: data,
        });
      });
    }
  });
});

app.post("/attachimg", function (req, res) {
  var data = req.body;
  var imageFile = req.files.zipfile;
  console.log(imageFile);
  var dir = "public/attachment/" + data.meeting_id + "/";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  imageFile.mv(
    "public/attachment/" + data.meeting_id + "/" + imageFile.name,
    function (error) {
      if (error) {
        console.log("couldn't upload the image file , error: ", error);
      } else {
        console.log("Image file successfully uploaded");
      }
    }
  );
});

// Start the HTTPS server
httpsServer.listen(3000, () => {
  console.log('HTTPS Server is running on https://localhost:3000');
});

// Optionally, create an HTTP server for fallback
const httpServer = http.createServer(app);
httpServer.listen(3001, () => {
  console.log('HTTP Server is running on http://localhost:3001');
});