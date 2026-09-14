import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent, Problem } from "./webviewContent";

export class CodeOutViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = "codeout.mainView";

    private _view?: vscode.WebviewView;
    private _problem?: Problem;
    private readonly socket: WebSocket;
    private syncTimer?: NodeJS.Timeout;
    private _testResults?: {
        case: string;
        status: string;
        output: string;
    }[];

    constructor(
        private readonly extensionUri: vscode.Uri,
        socket: WebSocket
    ) {
        this.socket = socket;
        this.socket.on("message", (message) => {
            const data = JSON.parse(message.toString());
            if (data.command === "testResults") {
                this._testResults = data.results;
                this.render();
            }
        });
        vscode.workspace.onDidChangeTextDocument((event) => {

        const editor = vscode.window.activeTextEditor;

        if (!editor) {
            return;
        }

        // Only sync the currently active CodeOut file
        if (event.document !== editor.document) {
            return;
        }

        // Cancel previous timer
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }

        // Wait until the user stops typing
        this.syncTimer = setTimeout(() => {

            const code = editor.document.getText();

            this.socket.send(JSON.stringify({
                command: "syncCode",
                code: code,
                language: editor.document.languageId
            }));

        }, 500);
    });
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

                const editor = vscode.window.activeTextEditor;

                if (!editor) {
                    vscode.window.showErrorMessage(
                        "No active editor found."
                    );
                    return;
                }

                if (message.command === "submit") {
                this.socket.send(JSON.stringify({
                    command: "submit"
                }));
            }

                if (message.command === "syncCode") {

                    const code = editor.document.getText();

                    this.socket.send(JSON.stringify({
                        command: "syncCode",
                        code: code,
                        language: editor.document.languageId
                    }));
                }

                if (message.command === "runTests") {

                    console.log("🔥 RUN TESTS RECEIVED BY PROVIDER");
                    this._testResults = this._problem?.testcases.map(
                        (_, index) => ({
                            case: `Case ${index + 1}`,
                            status: "RUNNING",
                            output: ""
                        })
                    );
                    this.render();

                    const editor = vscode.window.activeTextEditor;

                    if (!editor) {
                        console.log("❌ No active editor");
                        return;
                    }

                    const code = editor.document.getText();

                    console.log("🔥 Sending runCode to server");

                    this.socket.send(JSON.stringify({
                        command: "runCode",
                        code: code,
                        language: editor.document.languageId
                    }));
                }
            }
        );
    }

    public setProblem(problem: Problem): void {
        this._problem = problem;
        // Reset previous test results
        this._testResults = undefined;
        this.render();
    }


    private render(): void {

        if (!this._view || !this._problem) {
            return;
        }

        this._view.webview.html = getWebviewContent(
            this._view.webview,
            this.extensionUri,
            this._problem,
            this._testResults,
        );
    }
}