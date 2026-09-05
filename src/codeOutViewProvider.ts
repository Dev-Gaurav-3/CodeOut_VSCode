import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent, Problem } from "./webviewContent";

export class CodeOutViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = "codeout.mainView";

    private _view?: vscode.WebviewView;
    private _problem?: Problem;
    private readonly socket: WebSocket;

    constructor(
        private readonly extensionUri: vscode.Uri,
        socket: WebSocket
    ) {
        this.socket = socket;
    }

    resolveWebviewView(
        webviewView: vscode.WebviewView
    ): void {

        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,

            localResourceRoots: [
                vscode.Uri.joinPath(
                    this.extensionUri,
                    "node_modules",
                    "@vscode",
                    "codicons",
                    "dist"
                )
            ]
        };
        

        this.render();
        webviewView.webview.onDidReceiveMessage(
            async message => {
                console.log("🔥 MESSAGE FROM WEBVIEW:", message);

                if (message.command === "runTests") {
                    const editor = vscode.window.activeTextEditor;

                    if (!editor) {
                        console.log("❌ No active editor");
                        return;
                    }

                    const code = editor.document.getText();

                    console.log("📄 Running:", editor.document.fileName);
                    console.log("💻 Code length:", code.length);
                    this.socket.send(JSON.stringify({
                        command: "runCode",
                        code: code
                    }));
                }
            }
        );
    }

    public setProblem(problem: Problem): void {
        this._problem = problem;
        this.render();
    }


    private render(): void {

        if (!this._view || !this._problem) {
            return;
        }

        this._view.webview.html = getWebviewContent(
            this._view.webview,
            this.extensionUri,
            this._problem
        );
    }
}