const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

io.on("connection", (socket) => {
    socket.on("voice", (data) => {
        socket.broadcast.emit("voice", data);
    });
});

http.listen(3000);