// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import WebSocket from "ws";
import * as path from "path";
import { spawn } from "child_process";
import { CodeOutViewProvider } from "./codeOutViewProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

type TestCase = {
    input: string;
    expectedOutput?: string;
};

export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "codeout" is now active!');

	function startServer() {
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
	console.log("🚀 CODEOUT NEW VERSION LOADED");
	
	console.log("🔥 CodeOut WebviewView REGISTERED 🔥");
	
	const uriHandler = vscode.window.registerUriHandler({
		async handleUri(uri: vscode.Uri) {
			console.log("🔥 URI HANDLER ACTIVATED");
			console.log("CodeOut received:", uri.toString());
			const params = new URLSearchParams(uri.query);
			const slug = params.get("slug");
			console.log("Slug Received: ",slug);
			console.log("Raw query:", uri.query);
			vscode.window.showInformationMessage(
				`CodeOut received: ${uri.toString()}`
			);
			
			const workspace = vscode.workspace.workspaceFolders;
			const workspaceUri = workspace?.[0]?.uri;
			if (workspaceUri) {
				const fileUri = vscode.Uri.joinPath(
					workspaceUri,
					"longest-palindromic-substring.cpp"
				);
				console.log("File URI:", fileUri);
			}
		}
	});
	
	let socket: WebSocket;
	let codeOutViewProvider: CodeOutViewProvider;

	function connectToServer() {

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
			console.log("Connected to CodeOut server!");

			socket.send(JSON.stringify({
				type: "register",
				client: "vscode"
			}));
		});

		socket.on("message", async (message) => {
			console.log("🔥 MESSAGE RECEIVED FROM SERVER");
			const data = JSON.parse(message.toString());

			// Results are handled by CodeOutViewProvider.
			if (
				data.command === "testResult" ||
				data.command === "testResults"
			) {
				return;
			}

			const problem = data;

			codeOutViewProvider.setProblem(problem);

			console.log("Parsed problem:", problem);


			const language = await vscode.window.showQuickPick(
				[
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
				],
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
				(snippet: any) => snippet.lang === language
			);
			console.log("Selected snippet:", snippet);
			console.log("Selected language:", language);

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

			const extensionMap: Record<string, string> = {
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

			const fileExtension = extensionMap[language];
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

			const document = await vscode.workspace.openTextDocument(fileUri);
			await vscode.window.showTextDocument(document);
		});

		socket.on("error", (error) => {
			console.error("WebSocket error:", error);
		});

		socket.on("close", () => {
			console.log("Disconnected from CodeOut server");

			setTimeout(connectToServer, 500);
		});
	}
	startServer();
	connectToServer();

	context.subscriptions.push(uriHandler);
	
	const testUriCommand = vscode.commands.registerCommand(
		'codeout.testUri',
		async () => {
			
			const uri = vscode.Uri.parse("codeout://problem?slug=two-sum");
			vscode.window.showInformationMessage(
				`Test URI: ${uri.toString()}`
			);
			
			console.log("Test URI:", uri.toString());
			console.log(uri.scheme);
			console.log(uri.path);
			console.log(uri.query);

		}
	);

	context.subscriptions.push(testUriCommand);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('codeout.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const language = await vscode.window.showQuickPick(
    [
        "C++",
        "Java",
        "Python3",
        "Python",
        "JavaScript",
        "TypeScript",
        "C#",
        "C",
        "Go",
        "Kotlin",
        "Swift",
        "Rust",
        "Ruby",
        "PHP",
        "Dart",
        "Scala",
        "Elixir",
        "Erlang",
        "Racket"
    ],
    {
        placeHolder: "Select the language you want to use"
    }
);

	if (!language) {
		return;
	}

	vscode.window.showInformationMessage(
		`You selected ${language}`
	);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}