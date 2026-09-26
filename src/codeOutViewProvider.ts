import * as vscode from "vscode";
import WebSocket from "ws";
import { getWebviewContent, Problem } from "./webviewContent";

type TestResult = {
    case: string;
    status: string;
    output: string;
};

export class CodeOutViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "codeout.mainView";

    private _view?: vscode.WebviewView;
    private _problem?: Problem;
    private socket: WebSocket;
    private syncTimer?: NodeJS.Timeout;
    private _testResults?: TestResult[];

    constructor(
        private readonly extensionUri: vscode.Uri,
        socket: WebSocket
    ) {
        this.socket = socket;
        this.setupSocket(socket);

        vscode.workspace.onDidChangeTextDocument((event) => {
            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                return;
            }

            if (event.document !== editor.document) {
                return;
            }

            if (this.syncTimer) {
                clearTimeout(this.syncTimer);
            }

            this.syncTimer = setTimeout(() => {
                const code = editor.document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "syncCode",
                        code,
                        language: editor.document.languageId
                    })
                );
            }, 500);
        });
    }

    private setupSocket(socket: WebSocket): void {
        socket.on("message", (message) => {
            const data = JSON.parse(message.toString());

            if (data.command === "testResults") {
                this._testResults = data.results;
                this.render();
            }
        });
    }

    public setSocket(socket: WebSocket): void {
        this.socket = socket;
        this.setupSocket(socket);
    }

    resolveWebviewView(webviewView: vscode.WebviewView): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(
                    this.extensionUri,
                    "resources"
                )
            ]
        };

        this.render();

        webviewView.webview.onDidReceiveMessage(async (message) => {

            if (message.command === "openLink") {
                const links: Record<string, string> = {
                    github: "https://github.com/Dev-Gaurav-3/CodeOut_VSCode",
                    feedback: "https://forms.gle/XDL9uwndRMGUjkhQ8",
                    bugs: "https://github.com/Dev-Gaurav-3/CodeOut_VSCode/issues",
                    support: "https://buymeacoffee.com/gaurav003"
                };

                const url = links[message.target];

                if (url) {
                    await vscode.env.openExternal(
                        vscode.Uri.parse(url)
                    );
                }

                return;
            }

            const editor = vscode.window.activeTextEditor;

            if (!editor) {
                vscode.window.showErrorMessage(
                    "No active editor found."
                );
                return;
            }

            if (message.command === "submit") {
                this.socket.send(
                    JSON.stringify({
                        command: "submit"
                    })
                );

                return;
            }

            if (message.command === "syncCode") {
                const code = editor.document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "syncCode",
                        code,
                        language: editor.document.languageId
                    })
                );

                return;
            }

            if (message.command === "runTests") {
                this._testResults = this._problem?.testcases.map(
                    (_, index) => ({
                        case: `Case ${index + 1}`,
                        status: "RUNNING",
                        output: ""
                    })
                );

                this.render();

                const code = editor.document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "runCode",
                        code,
                        language: editor.document.languageId
                    })
                );

                return;
            }
        });
    }

    public run(): void {
        this._view?.webview.postMessage({
            command: "runTests"
        });
    }

    public submit(): void {
        this._view?.webview.postMessage({
            command: "submit"
        });
    }

    public setProblem(problem: Problem): void {
        this._problem = problem;
        this._testResults = undefined;
        this.render();
    }

    private render(): void {
        if (!this._view) {
            return;
        }

        this._view.webview.html = getWebviewContent(
            this._view.webview,
            this.extensionUri,
            this._problem,
            this._testResults
        );
    }
}