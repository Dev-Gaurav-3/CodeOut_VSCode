const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/problem", (req, res) => {
    console.log("Problem request received");

    if (!vscodeSocket) {
        console.log("❌ VS Code is not connected");
        return res.status(503).send("VS Code is not connected");
    }

    vscodeSocket.send(JSON.stringify(req.body));

    res.send("Problem received");
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server });

let vscodeSocket;
let browserSocket;

wss.on("connection", (client) => {
    console.log("New WebSocket connection!");

    client.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "register") {
        if (data.client === "vscode") {
            vscodeSocket = client;
            console.log("VS Code registered!");
        }

        if (data.client === "browser") {
            browserSocket = client;
            console.log("Browser extension registered!");
        }

        return;
    }

    if (data.command === "syncCode") {
        if (!browserSocket) {
            console.log("❌ Browser extension is not connected");
            return;
        }

        browserSocket.send(JSON.stringify(data));

        return;
    }
    if (data.command === "runCode") {
        if (!browserSocket) {
            console.log("❌ Browser extension is not connected");
            return;
        }

        browserSocket.send(JSON.stringify(data));
        console.log("➡️ Sent runCode to browser extension");

        return;
    }
        if (data.command === "testResult") {
            if (!vscodeSocket) {
                console.log("❌ VS Code is not connected");
                return;
            }

            vscodeSocket.send(JSON.stringify(data));

            console.log("➡️ Sent test result to VS Code");

            return;
        }
        if (data.command === "testResults") {
            if (!vscodeSocket) {
                console.log("❌ VS Code is not connected");
                return;
            }

            vscodeSocket.send(JSON.stringify(data));
            return;
        }
        console.log("Message received:", data);

        if (data.command === "submit") {
            if (!browserSocket) {
                return;
            }

            browserSocket.send(JSON.stringify(data));
            console.log("➡️ Sent submit to browser extension");
            return;
        }
    });

    client.on("close", () => {
        if (client === vscodeSocket) {
            vscodeSocket = undefined;
            console.log("VS Code disconnected");
        }

        if (client === browserSocket) {
            browserSocket = undefined;
            console.log("Browser extension disconnected");
        }
    });
});

server.listen(48721, () => {
    console.log("CodeOut server running on port 48721");
});