const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const app = express();

app.use(cors());
app.use(express.json());

let vscodeSocket;
let browserSocket;

app.post("/problem", (req, res) => {
    if (!vscodeSocket) {
        console.log("❌ VS Code is not connected");
        return res.status(503).send("VS Code is not connected");
    }

    vscodeSocket.send(JSON.stringify(req.body));
    res.send("Problem received");
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (client) => {
    client.on("message", (message) => {
        const data = JSON.parse(message.toString());

        if (data.type === "register") {
            if (data.client === "vscode") {
                vscodeSocket = client;
            }

            if (data.client === "browser") {
                browserSocket = client;
            }

            return;
        }

        if (data.command === "syncCode" || data.command === "runCode") {
            if (!browserSocket) {
                console.log("❌ Browser extension is not connected");
                return;
            }

            browserSocket.send(JSON.stringify(data));
            return;
        }

        if (
            data.command === "testResult" ||
            data.command === "testResults"
        ) {
            if (!vscodeSocket) {
                console.log("❌ VS Code is not connected");
                return;
            }

            vscodeSocket.send(JSON.stringify(data));
            return;
        }

        if (data.command === "submit") {
            if (!browserSocket) {
                console.log("❌ Browser extension is not connected");
                return;
            }

            browserSocket.send(JSON.stringify(data));
        }
    });

    client.on("close", () => {
        if (client === vscodeSocket) {
            vscodeSocket = undefined;
        }

        if (client === browserSocket) {
            browserSocket = undefined;
        }
    });
});

server.listen(48721, () => {
    console.log("CodeOut server running on port 48721");
});