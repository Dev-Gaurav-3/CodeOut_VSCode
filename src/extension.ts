import * as vscode from "vscode";
import WebSocket from "ws";
import * as path from "path";
import { spawn } from "child_process";
import { CodeOutViewProvider } from "./codeOutViewProvider";

const SUPPORTED_LANGUAGES = [
    "C++",
    "Python3",
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C",
    "C#",
    "Go",
    "Rust"
];

const EXTENSION_MAP: Record<string, string> = {
    "C++": ".cpp",
    "Python3": ".py",
    "Python": ".py",
    "Java": ".java",
    "JavaScript": ".js",
    "TypeScript": ".ts",
    "C": ".c",
    "C#": ".cs",
    "Go": ".go",
    "Rust": ".rs"
};

export function activate(context: vscode.ExtensionContext) {

    let socket: WebSocket;
    let codeOutViewProvider: CodeOutViewProvider;

    const runCommand = vscode.commands.registerCommand(
        "codeout.run",
        () => {
            codeOutViewProvider?.run();
        }
    );

    const submitCommand = vscode.commands.registerCommand(
        "codeout.submit",
        () => {
            codeOutViewProvider?.submit();
        }
    );

    context.subscriptions.push(runCommand, submitCommand);

    function startServer(): void {
        const serverPath = path.join(
            context.extensionPath,
            "server",
            "server.js"
        );

        const server = spawn(
            process.execPath,
            [serverPath],
            {
                cwd: path.dirname(serverPath),
                detached: true,
                stdio: "ignore"
            }
        );

        server.unref();
    }

    function connectToServer(): void {
        socket = new WebSocket("ws://localhost:48721");

        if (!codeOutViewProvider) {
            codeOutViewProvider = new CodeOutViewProvider(
                context.extensionUri,
                socket
            );

            context.subscriptions.push(
                vscode.window.registerWebviewViewProvider(
                    CodeOutViewProvider.viewType,
                    codeOutViewProvider
                )
            );
        } else {
            codeOutViewProvider.setSocket(socket);
        }

        socket.on("open", () => {
            socket.send(
                JSON.stringify({
                    type: "register",
                    client: "vscode"
                })
            );
        });

        socket.on("message", async (message) => {
            const data = JSON.parse(message.toString());

            if (
                data.command === "testResult" ||
                data.command === "testResults"
            ) {
                return;
            }

            const problem = data;

            codeOutViewProvider.setProblem(problem);

            const language = await vscode.window.showQuickPick(
                SUPPORTED_LANGUAGES,
                {
                    placeHolder: "Select the language you want to use"
                }
            );

            if (!language) {
                return;
            }

            await vscode.commands.executeCommand(
                "workbench.view.extension.codeout"
            );

            const snippet = problem.codeSnippets.find(
                (item: { lang: string; code: string }) =>
                    item.lang === language
            );

            if (!snippet) {
                vscode.window.showErrorMessage(
                    `No code snippet found for ${language}`
                );
                return;
            }

            const workspaceUri =
                vscode.workspace.workspaceFolders?.[0]?.uri;

            if (!workspaceUri) {
                vscode.window.showErrorMessage(
                    "Please open a workspace folder first."
                );
                return;
            }

            const fileExtension = EXTENSION_MAP[language];

            const fileUri = vscode.Uri.joinPath(
                workspaceUri,
                `${problem.questionFrontendId}_${problem.slug}${fileExtension}`
            );

            let fileExists = true;

            try {
                await vscode.workspace.fs.stat(fileUri);
            } catch {
                fileExists = false;
            }

            if (!fileExists) {
                await vscode.workspace.fs.writeFile(
                    fileUri,
                    Buffer.from(snippet.code, "utf8")
                );
            }

            const document =
                await vscode.workspace.openTextDocument(fileUri);

            await vscode.window.showTextDocument(document);
        });

        socket.on("error", (error) => {
            console.error("CodeOut WebSocket error:", error);
        });

        socket.on("close", () => {
            setTimeout(connectToServer, 500);
        });
    }

    startServer();
    connectToServer();
}

export function deactivate(): void {}