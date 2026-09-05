const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const { SocketAddress } = require("net");

const app = express();

app.use(cors());
app.use(express.json());

let socket;

app.post("/problem", (req, res) => {
    console.log("Problem request received");
    console.log("Body:", req.body);
    socket.send(JSON.stringify(req.body));
    res.send("Problem received");
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
    console.log("VS Code connected!");

    socket = client;

    client.on("message", (message) => {
        console.log("Message from VS Code:", message.toString());
    });

    client.on("close", () => {
        console.log("VS Code disconnected");
    });
});

server.listen(3000, () => {
    console.log("CodeOut server running on port 3000");
});