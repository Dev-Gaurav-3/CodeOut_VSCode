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
    private _codeOutDocument?: vscode.Uri;
    private socket: WebSocket;
    private syncTimer?: NodeJS.Timeout;
    private _testResults?: TestResult[];
    private _isContestProblem = false;
    private _contestWarningDismissed = false;
    private runTimeout?: NodeJS.Timeout;

    private checkCodeOutTab(): void {
    if (!this._codeOutDocument) {
        return;
    }

    const codeOutUri = this._codeOutDocument.toString();
        const isOpen = vscode.window.tabGroups.all.some(group =>
            group.tabs.some(tab => {
                const input = tab.input;

                return (
                    input instanceof vscode.TabInputText &&
                    input.uri.toString() === codeOutUri
                );
            })
        );

        if (isOpen) {
            return;
        }

        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
            this.syncTimer = undefined;
        }

        this._codeOutDocument = undefined;
        this._problem = undefined;
        this._testResults = undefined;

        this.render();
    }

    constructor(
        private readonly extensionUri: vscode.Uri,
        socket: WebSocket
    ) {
        this.socket = socket;
        this.setupSocket(socket);

        vscode.workspace.onDidChangeTextDocument((event) => {
            if (!this._codeOutDocument) {
                return;
            }

            if (this._isContestProblem) {
               return;
            }

            if (
                event.document.uri.toString() !==
                this._codeOutDocument.toString()
            ) {
                return;
            }

            if (this.syncTimer) {
                clearTimeout(this.syncTimer);
            }

            this.syncTimer = setTimeout(() => {

                if (!this._codeOutDocument) {
                    return;
                }

                const code = event.document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "syncCode",
                        code,
                        language: event.document.languageId
                    })
                );

            }, 500);
        });

        vscode.window.tabGroups.onDidChangeTabs(() => {
            this.checkCodeOutTab();
        });

        vscode.workspace.onDidCloseTextDocument((document) => {
            if (
                !this._codeOutDocument ||
                document.uri.toString() !==
                this._codeOutDocument.toString()
            ) {
                return;
            }

            if (this.syncTimer) {
                clearTimeout(this.syncTimer);
                this.syncTimer = undefined;
            }

            this._codeOutDocument = undefined;
            this._problem = undefined;
            this._testResults = undefined;

            this.render();
        });
        }

    private getCodeOutDocument(): vscode.TextDocument | undefined {
        if (!this._codeOutDocument) {
            return undefined;
        }

        return vscode.workspace.textDocuments.find(
            document =>
                document.uri.toString() ===
                this._codeOutDocument!.toString()
        );
    }

    private setupSocket(socket: WebSocket): void {
        socket.on("message", (message) => {
            const data = JSON.parse(message.toString());

            if (data.command === "testResults") {
                if (this.runTimeout) {
                    clearTimeout(this.runTimeout);
                    this.runTimeout = undefined;
                }

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
                    firefox : "https://addons.mozilla.org/en-US/firefox/addon/codeout/",
                    edge : "https://microsoftedge.microsoft.com/addons/detail/pkpobpaobgnhnnfkpgdepkdadihnpcki",
                    support:"https://buymeacoffee.com/itzgaurav0w"

                };

                const url = links[message.target];

                if (url) {
                    await vscode.env.openExternal(
                        vscode.Uri.parse(url)
                    );
                }

                return;
            }
            if (message.command === "dismissContestWarning") {
                this._contestWarningDismissed = true;
                this.render();
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
                const document = this.getCodeOutDocument();

                if (!document) {
                    vscode.window.showErrorMessage(
                        "CodeOut file is not open."
                    );
                    return;
                }

                const code = document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "syncCode",
                        code,
                        language: document.languageId
                    })
                );

                return;
            }
            if (message.command === "runTests") {
                if (this.runTimeout) {
                    clearTimeout(this.runTimeout);
                    this.runTimeout = undefined;
                }

                const document = this.getCodeOutDocument();

                if (!document) {
                    vscode.window.showErrorMessage(
                        "CodeOut file is not open."
                    );
                    return;
                }

                this._testResults = this._problem?.testcases.map(
                    (_, index) => ({
                        case: `Case ${index + 1}`,
                        status: "RUNNING",
                        output: ""
                    })
                );

                this.render();

                const code = document.getText();

                this.socket.send(
                    JSON.stringify({
                        command: "runCode",
                        code,
                        language: document.languageId
                    })
                );

                this.runTimeout = setTimeout(() => {

                    if (this._testResults) {
                        this._testResults = this._testResults.map(test => ({
                            ...test,
                            status: "FAILED",
                            output: "LeetCode did not respond within 15 seconds."
                        }));
                    }

                    this.render();

                    vscode.window.showWarningMessage(
                        "CodeOut is still waiting for LeetCode. The page may be disconnected or unresponsive. Please reload the LeetCode problem and try again."
                    );

                    this.runTimeout = undefined;

                }, 15000);

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

    public setCodeOutDocument(uri: vscode.Uri): void {
        this._codeOutDocument = uri;
    }

    public setProblem(problem: Problem): void {
        this._problem = problem;
        this._isContestProblem = problem.isContestProblem;
        this._contestWarningDismissed = false;
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
            this._testResults,
            this._contestWarningDismissed
        );
    }
}