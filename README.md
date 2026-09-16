<div align="center">

<pre>
         ██████╗ ██████╗ ██████╗ ███████╗ ██████╗ ██╗   ██╗████████╗
        ██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔═══██╗██║   ██║╚══██╔══╝
     ██║     ██║   ██║██║  ██║█████╗  ██║   ██║██║   ██║   ██║
        ██║     ██║   ██║██║  ██║██╔══╝  ██║   ██║██║   ██║   ██║   
        ╚██████╗╚██████╔╝██████╔╝███████╗╚██████╔╝╚██████╔╝   ██║   
        ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝ ╚═════╝  ╚═════╝    ╚═╝   
</pre>

</div>

<p align="center">
  <img src="resources/Logo2.png" width="100" alt="CodeOut">
</p>

<h3 align="center">LeetCode, directly from VS Code.</h3>

<p align="center">
  Solve, run, sync, and submit LeetCode problems without constantly switching between your editor and browser.
</p>

<p align="center">
  <a href="https://github.com/Dev-Gaurav-3/CodeOut_Browser">Browser Extension</a>
  &nbsp;•&nbsp;
  <a href="https://github.com/Dev-Gaurav-3/CodeOut_VSCode/issues">Report a Bug</a>
</p>

---

## 🚀 Overview

**CodeOut** is a VS Code extension that connects **LeetCode** with your local VS Code development environment.

It allows you to:

- 📥 Open LeetCode problems directly in VS Code
- 🧑‍💻 Solve problems using the VS Code editor
- 🔄 Synchronize code between VS Code and LeetCode
- ▶️ Run LeetCode test cases from VS Code
- 🧪 View individual test-case results
- 📤 Submit solutions directly from VS Code
- ⌨️ Use native VS Code keyboard shortcuts

CodeOut uses a lightweight local WebSocket server to communicate between the VS Code extension and the CodeOut browser extension.

---

## ✨ Features

### 📥 Problem Transfer

Open a problem on LeetCode and launch CodeOut from the browser extension.

The problem information is automatically transferred to VS Code.

### 📁 Automatic Problem Files

CodeOut creates a source file using the LeetCode problem ID and slug.

For example:

```text
1_two-sum.cpp
```

The appropriate LeetCode starter code is inserted when the file is created.

Existing problem files are never overwritten.

### 🔄 Automatic Code Sync

Changes made in VS Code are automatically synchronized with the LeetCode editor.

A manual **Sync Code** button is also available.

### ▶️ Run from VS Code

Run LeetCode test cases directly from the CodeOut sidebar.

Shortcut:

```text
Ctrl + Enter
```

CodeOut sends the current code to LeetCode and triggers LeetCode's native Run functionality.

### 🧪 Test Case Results

Test results are displayed individually inside the CodeOut sidebar.

Supported states include:

```text
RUNNING
ACCEPTED
WRONG ANSWER
RUNTIME ERROR
COMPILE ERROR
```

Accepted test cases are automatically collapsed while failed test cases remain expanded.

### 📤 Submit from VS Code

Submit your solution without leaving VS Code.

Shortcut:

```text
Ctrl + Shift + Enter
```

### 🔌 Automatic Server Startup

CodeOut automatically starts its local communication server when the VS Code extension is activated.

### 🔁 WebSocket Reconnection

If the connection between VS Code and the local CodeOut server is interrupted, CodeOut automatically attempts to reconnect.

---

## 🏗️ Architecture

```text
┌──────────────────────────────┐
│           LeetCode           │
│                              │
│  Monaco Editor               │
│  Test Cases                  │
│  Run / Submit                │
└──────────────┬───────────────┘
               │
               │ DOM / Monaco
               ▼
┌──────────────────────────────┐
│           page.js            │
│                              │
│  LeetCode page interaction   │
└──────────────┬───────────────┘
               │
               │ window.postMessage
               ▼
┌──────────────────────────────┐
│         content.js           │
│                              │
│    Browser Extension         │
└──────────────┬───────────────┘
               │
               │ WebSocket
               ▼
┌──────────────────────────────┐
│        CodeOut Server        │
│      localhost:48721         │
└──────────────┬───────────────┘
               │
               │ WebSocket
               ▼
┌──────────────────────────────┐
│      CodeOut VS Code         │
│          Extension           │
│                              │
│  Extension Host              │
│          ↕                   │
│  WebView Sidebar             │
│          ↕                   │
│  VS Code Editor              │
└──────────────────────────────┘
```

---

## 🔄 Workflow

### 1. Open a LeetCode Problem

Open a problem on LeetCode and click the CodeOut browser extension.

The browser extension extracts the problem information and sends it to the local CodeOut server.

### 2. Select a Language

CodeOut displays a language picker in VS Code.

The selected language determines the file extension and starter code.

### 3. Solve in VS Code

Write your solution using the VS Code editor.

CodeOut automatically synchronizes changes with the LeetCode editor.

### 4. Run

Press:

```text
Ctrl + Enter
```

CodeOut updates the LeetCode editor and triggers LeetCode's native Run action.

The resulting test-case statuses are sent back to VS Code.

### 5. Submit

Press:

```text
Ctrl + Shift + Enter
```

CodeOut triggers LeetCode's native Submit action.

---

## 🌍 Supported Languages

| Language | Extension |
|---|---|
| C++ | `.cpp` |
| C | `.c` |
| C# | `.cs` |
| Java | `.java` |
| JavaScript | `.js` |
| TypeScript | `.ts` |
| Python | `.py` |
| Python3 | `.py` |
| Go | `.go` |
| Rust | `.rs` |

---

## ⌨️ Keyboard Shortcuts

| Command | Shortcut |
|---|---|
| CodeOut: Run | `Ctrl + Enter` |
| CodeOut: Submit | `Ctrl + Shift + Enter` |

Shortcuts can be customized through the native VS Code Keyboard Shortcuts interface.

Open:

```text
Ctrl + K
Ctrl + S
```

Then search for:

```text
CodeOut
```

---

## 📂 Project Structure

```text
CodeOut_VSCode/
│
├── src/
│   ├── extension.ts
│   ├── codeOutViewProvider.ts
│   └── webviewContent.ts
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
│
├── resources/
│   └── CodeOut_sidebar_icon.svg
│
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── README.md
```

---

## 🛠️ Tech Stack

- TypeScript
- VS Code Extension API
- VS Code Webview API
- Node.js
- Express
- WebSocket (`ws`)
- LeetCode GraphQL
- JavaScript
- WebExtensions API

---

## 📦 Installation

### Install from VSIX

Download the latest `.vsix` package.

In VS Code:

```text
Extensions
    ↓
...
    ↓
Install from VSIX...
```

Select the CodeOut `.vsix` file.

### Build from Source

```bash
git clone https://github.com/Dev-Gaurav-3/CodeOut_VSCode.git
cd CodeOut_VSCode
npm install
npm run compile
npm run package
```

The generated `.vsix` file can be installed directly in VS Code.

---

## 🌐 Browser Extension

The VS Code extension works together with the CodeOut browser extension.

**CodeOut Browser Extension:**

https://github.com/Dev-Gaurav-3/CodeOut_Browser

Both components communicate through the local CodeOut server.

---

## 🔌 Local Server

The CodeOut server runs locally on:

```text
ws://localhost:48721
```

The server acts as the communication bridge between the browser extension and VS Code.

No external CodeOut backend is required.

---

## 🔐 Privacy

CodeOut uses a local communication server running on your machine:

```text
localhost:48721
```

The core communication between the browser extension and VS Code takes place through this local server.

No CodeOut cloud account is required.

---

## 🚧 Project Status

The core LeetCode ↔ VS Code workflow is implemented and tested.

### Working

- Problem transfer
- Language selection
- Problem file creation
- Starter code insertion
- Automatic code synchronization
- Manual code synchronization
- Test-case execution
- Individual test-case results
- Runtime error detection
- Compile error detection
- Time-limit-exceeded detection
- Memory-limit-exceeded detection
- Solution submission
- Keyboard shortcuts
- Automatic server startup
- WebSocket reconnection

---

## 🔮 Future Plans

- Support for additional online judges
- Judge-specific adapters
- Improved result handling
- Additional competitive programming workflows

---

## 🤝 Contributing

Contributions, suggestions, and bug reports are welcome.

If you find a bug or have an idea for improving CodeOut, please open an issue.

---

## 📄 License

See the repository license for details.

---

## 👨‍💻 Author

**Gaurav**

Built with ❤️ for competitive programmers. who are tired of switching Leetcode and VS Code.
