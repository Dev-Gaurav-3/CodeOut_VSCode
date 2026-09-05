import * as vscode from "vscode";

interface TestCase {
    input: string;
    expectedOutput?: string;
}

export interface Problem {
    questionFrontendId?: string;
    title: string;
    difficulty: string;
    testcases: TestCase[];
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getNonce(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 32; i++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
}

function getStatusIcon(status: "pending" | "pass" | "fail"): string {
    if (status === "pass") return "codicon-check";
    if (status === "fail") return "codicon-error";
    return "codicon-clock";
}

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    problem: Problem
): string {
    const nonce = getNonce();
    const codiconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "node_modules", "@vscode", "codicons", "dist", "codicon.css")
    );

    const difficultyClass = problem.difficulty.toLowerCase();
    const idLabel = problem.questionFrontendId ? `${escapeHtml(problem.questionFrontendId)}. ` : "";
    const total = problem.testcases.length;

    const casesHtml = problem.testcases
        .map((testcase, index) => {
            const input = escapeHtml(testcase.input);
            const expected = escapeHtml(testcase.expectedOutput ?? "Not available");
            const status = "pending";
            const statusLabel = "Ready";

            return `
                <div class="case status-${status}">
                    <button class="case-header" type="button" aria-expanded="true">
                        <span class="case-header-left">
                            <i class="codicon codicon-chevron-down"></i>
                            <span class="case-label">Test Case ${index + 1}</span>
                        </span>
                        <span class="status-chip">
                            <i class="codicon ${getStatusIcon(status)}"></i>
                            ${statusLabel}
                        </span>
                    </button>
                    <div class="case-body">
                        <div class="field">
                            <div class="field-label">
                                <span>Input</span>
                                <button class="copy-btn" type="button" data-copy="${input}" title="Copy input">
                                    <i class="codicon codicon-copy"></i>
                                </button>
                            </div>
                            <pre>${input}</pre>
                        </div>
                        <div class="field">
                            <div class="field-label">
                                <span>Expected Output</span>
                                <button class="copy-btn" type="button" data-copy="${expected}" title="Copy expected output">
                                    <i class="codicon codicon-copy"></i>
                                </button>
                            </div>
                            <pre>${expected}</pre>
                        </div>
                    </div>
                </div>`;
        })
        .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource} https://fonts.gstatic.com; style-src-elem ${webview.cspSource} 'unsafe-inline' https://fonts.googleapis.com; script-src 'nonce-${nonce}';">
<link href="${codiconUri}" rel="stylesheet" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
    :root {
        --co-purple: #9f7aea;
        --co-purple-dark: #805ad5;
        --co-blue: #63b3ed;
        --co-blue-dark: #4299e1;
        --co-green: #68d391;
        --co-green-dark: #48bb78;
        --co-red: #fc8181;
        
        --co-gradient-primary: linear-gradient(135deg, var(--co-purple-dark), var(--co-blue-dark));
        --co-gradient-hover: linear-gradient(135deg, #6b46c1, #3182ce);
        
        --co-glow-primary: 0 0 20px rgba(128, 90, 213, 0.4);
        --co-glow-success: 0 0 15px rgba(72, 187, 120, 0.4);
        
        --bg-main: var(--vscode-sideBar-background, #1e1e1e);
        --bg-card: var(--vscode-editorWidget-background, #252526);
        --border-color: var(--vscode-panel-border, #3c3c3c);
        --text-main: var(--vscode-foreground, #cccccc);
        --text-muted: var(--vscode-descriptionForeground, #999999);
    }

    html, body {
        height: 100%; margin: 0; padding: 0;
    }

    body {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: 'Inter', var(--vscode-font-family), sans-serif;
        font-size: 13px;
        color: var(--text-main);
        background: var(--bg-main);
        position: relative;
    }

    body::before {
        content: '';
        position: absolute;
        top: -100px;
        left: -50px;
        width: 250px;
        height: 250px;
        background: radial-gradient(circle, rgba(128, 90, 213, 0.15) 0%, rgba(128, 90, 213, 0) 70%);
        pointer-events: none;
        z-index: 0;
    }

    .accent-bar {
        flex: 0 0 auto;
        height: 3px;
        background: var(--co-gradient-primary);
        box-shadow: var(--co-glow-primary);
        z-index: 10;
    }

    .header {
        flex: 0 0 auto;
        position: relative;
        padding: 20px 16px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        background: linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%);
        z-index: 1;
    }

    .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
    }

    .brand-mark {
        flex: 0 0 auto;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--co-gradient-primary);
        box-shadow: var(--co-glow-primary), inset 0 1px 0 rgba(255,255,255,0.2);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 800;
        font-family: 'Inter', sans-serif;
        letter-spacing: -1px;
    }

    .title {
        font-size: 15px;
        font-weight: 700;
        line-height: 1.3;
        letter-spacing: -0.01em;
        color: var(--vscode-editor-foreground, #fff);
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    }

    .meta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
    }

    .badge-difficulty {
        display: inline-flex;
        align-items: center;
        border-radius: 6px;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #fff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .badge-difficulty.easy { background: linear-gradient(135deg, var(--co-green), var(--co-green-dark)); }
    .badge-difficulty.medium { background: linear-gradient(135deg, #ecc94b, #d69e2e); color: #1a202c; }
    .badge-difficulty.hard { background: linear-gradient(135deg, var(--co-red), #e53e3e); }

    .case-count {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 6px;
        padding: 3px 8px;
    }

    .cases {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 16px;
        z-index: 1;
        scroll-behavior: smooth;
    }
    .cases::-webkit-scrollbar { width: 6px; }
    .cases::-webkit-scrollbar-track { background: transparent; }
    .cases::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .cases::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

    .case {
        background: var(--bg-card);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05);
        transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
    }

    .case::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: rgba(255,255,255,0.1);
        transition: all 0.3s ease;
    }

    .case:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        border-color: rgba(255, 255, 255, 0.1);
    }

    .case.status-pass::before { background: var(--co-green); box-shadow: var(--co-glow-success); }
    .case.status-fail::before { background: var(--co-red); }
    .case.status-pending::before { background: var(--co-blue); }

    .case-header {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: transparent;
        border: none;
        color: inherit;
        font-family: inherit;
        font-size: 13px;
        padding: 12px 14px;
        cursor: pointer;
        transition: background 0.2s ease;
    }

    .case-header:hover {
        background: rgba(255, 255, 255, 0.03);
    }

    .case-header-left { display: flex; align-items: center; gap: 8px; }
    .case-header .codicon-chevron-down { 
        font-size: 16px; 
        color: var(--text-muted);
        transition: transform 0.2s ease; 
    }
    .case-header[aria-expanded="false"] .codicon-chevron-down { transform: rotate(-90deg); }

    .case-label { font-weight: 600; font-size: 14px; color: var(--text-main); }

    .status-chip {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 4px 8px;
        transition: all 0.2s ease;
    }

    .status-chip .codicon { font-size: 12px; }
    .status-pass .status-chip { color: var(--co-green); background: rgba(104, 211, 145, 0.1); box-shadow: inset 0 0 0 1px rgba(104, 211, 145, 0.2); }
    .status-fail .status-chip { color: var(--co-red); background: rgba(252, 129, 129, 0.1); box-shadow: inset 0 0 0 1px rgba(252, 129, 129, 0.2); }
    .status-pending .status-chip { color: var(--co-blue); background: rgba(99, 179, 237, 0.1); box-shadow: inset 0 0 0 1px rgba(99, 179, 237, 0.2); }

    .case.collapsed .case-body { display: none; }

    .case-body { 
        padding: 0 14px 14px; 
        border-top: 1px solid rgba(255,255,255,0.03);
    }

    .field { margin-top: 12px; }

    .field-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: var(--co-blue);
        margin-bottom: 6px;
    }

    .copy-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }

    .copy-btn:hover { 
        background: var(--co-blue-dark);
        color: #fff;
        border-color: var(--co-blue);
        box-shadow: 0 0 8px rgba(99, 179, 237, 0.4);
    }

    pre {
        background: rgba(0, 0, 0, 0.2);
        font-family: 'Fira Code', var(--vscode-editor-font-family), monospace;
        font-size: 12px;
        padding: 12px;
        border-radius: 8px;
        margin: 0;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-word;
        border: 1px solid rgba(255,255,255,0.05);
        color: var(--vscode-textPreformat-foreground, #e2e8f0);
    }

    .actions {
        flex: 0 0 auto;
        display: flex;
        gap: 12px;
        padding: 16px;
        background: rgba(30, 30, 30, 0.8);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        z-index: 10;
    }

    .btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        border-radius: 8px;
        padding: 12px 14px;
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        position: relative;
        overflow: hidden;
    }

    .btn::after {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    .btn:hover::after { opacity: 1; }
    .btn:focus-visible { outline: 2px solid var(--co-purple); outline-offset: 2px; }
    .btn:active { transform: scale(0.96); }

    .btn-run { 
        background: rgba(255, 255, 255, 0.05); 
        border: 1px solid rgba(255, 255, 255, 0.1); 
        color: var(--text-main); 
    }
    .btn-run:hover { 
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
    }

    .btn-submit {
        flex: 1.5;
        border: none;
        background: var(--co-gradient-primary);
        color: #ffffff;
        box-shadow: var(--co-glow-primary), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .btn-submit:hover { 
        background: var(--co-gradient-hover);
        box-shadow: 0 0 25px rgba(128, 90, 213, 0.6), inset 0 1px 0 rgba(255,255,255,0.2); 
        transform: translateY(-1px); 
    }
    .btn i { font-size: 16px; }
</style>
</head>
<body>
    <div class="accent-bar"></div>
    <div class="header">
        <div class="brand">
            <span class="brand-mark">&lt;/&gt;</span>
            <span class="title">${idLabel}${escapeHtml(problem.title)}</span>
        </div>
        <div class="meta-row">
            <span class="badge-difficulty ${difficultyClass}">${escapeHtml(problem.difficulty)}</span>
            <span class="case-count">${total} Test Case${total === 1 ? "" : "s"}</span>
        </div>
    </div>

    <div class="cases">
        ${casesHtml}
    </div>

    <div class="actions">
        <button id="runBtn" class="btn btn-run" type="button"><i class="codicon codicon-play"></i>Run</button>
        <button id="submitBtn" class="btn btn-submit" type="button"><i class="codicon codicon-cloud-upload"></i>Submit</button>
    </div>

    <script nonce="${nonce}">
        document.querySelectorAll(".case-header").forEach((header) => {
            header.addEventListener("click", () => {
                const caseEl = header.closest(".case");
                const expanded = header.getAttribute("aria-expanded") === "true";
                header.setAttribute("aria-expanded", String(!expanded));
                caseEl.classList.toggle("collapsed", expanded);
            });
        });

        document.querySelectorAll(".copy-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(btn.getAttribute("data-copy") || "");
                
                // Visual feedback
                const icon = btn.querySelector('.codicon');
                const oldClass = icon.className;
                icon.className = 'codicon codicon-check';
                icon.style.color = 'var(--co-green)';
                setTimeout(() => {
                    icon.className = oldClass;
                    icon.style.color = '';
                }, 1000);
            });
        });
        const vscode = acquireVsCodeApi();
        const runBtn = document.getElementById("runBtn");

        runBtn.addEventListener("click", () => {
            vscode.postMessage({
                command: "runTests"
            });
        });
    </script>
</body>
</html>`;
}