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

function getBottomActions(): string {
    return /* html */ `
        <div class="bottom-section">

            <div class="action-row">

                <button class="action-button" data-action="github">
                    <span class="codicon codicon-github"></span>
                    <span>GitHub</span>
                </button>

                <button class="action-button" data-action="feedback">
                    <span class="codicon codicon-comment-discussion"></span>
                    <span>Feedback</span>
                </button>

                <button class="action-button" data-action="bugs">
                    <span class="codicon codicon-bug"></span>
                    <span>Bugs</span>
                </button>

            </div>

            <button class="support-button" data-action="support">
                <span class="codicon codicon-heart"></span>
                <span>Buy Me a Coffee</span>
            </button>

            <div class="footer">
                CodeOut · v0.0.1
            </div>

        </div>
    `;
    
}

function getStatusIcon(status: "pending" | "pass" | "fail"): string {
    if (status === "pass") return "codicon-check";
    if (status === "fail") return "codicon-error";
    return "codicon-clock";
}

function getWelcomeScreen(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
): string {
    const nonce = getNonce();
    const logoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
            extensionUri,
            "resources",
            "CodeOut_sidebar_icon.svg"
        )
    );
    const codiconsUri = webview.asWebviewUri(
        vscode.Uri.joinPath(
            extensionUri,
            "node_modules",
            "@vscode",
            "codicons",
            "dist",
            "codicon.css"
        )
    );

    return /* html */ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <link
                href="${codiconsUri}"
                rel="stylesheet"
            />
            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;

                    background: #1e1e1e;
                    color: #cccccc;

                    font-family:
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        Roboto,
                        sans-serif;

                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .container {
                    width: 100%;
                    padding: 28px 20px;
                    text-align: center;
                }

                .logo {
                    width: 72px;
                    height: 72px;

                    margin: 0 auto 18px;

                    object-fit: contain;
                }

                .title {
                    font-size: 22px;
                    font-weight: 600;

                    color: #ffffff;

                    margin-bottom: 6px;
                }

                .subtitle {
                    font-size: 13px;
                    color: #858585;

                    margin-bottom: 28px;
                }

                .message {
                    background: #252526;

                    border: 1px solid #333333;
                    border-radius: 8px;

                    padding: 18px 14px;

                    margin-bottom: 22px;
                }

                .message-title {
                    font-size: 14px;
                    font-weight: 600;

                    color: #cccccc;

                    margin-bottom: 8px;
                }

                .message-text {
                    font-size: 12px;
                    line-height: 1.6;

                    color: #858585;
                }

                .features {
                    display: flex;
                    flex-direction: column;

                    gap: 10px;

                    text-align: left;
                }

                .feature {
                    display: flex;
                    align-items: center;

                    gap: 10px;

                    font-size: 12px;
                    color: #bdbdbd;
                }

                .check {
                    width: 20px;
                    height: 20px;

                    flex-shrink: 0;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 50%;

                    background: #2d2d2d;

                    color: #89d185;

                    font-size: 11px;
                }

                .footer {
                    margin-top: 28px;

                    font-size: 11px;
                    color: #555555;
                }
                

            .bottom-section {
                margin-top: auto;
                padding-top: 12px;
            }

            .action-row {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 4px;
            }

            .action-button,
            .support-button {
                border: none;
                cursor: pointer;

                background: #252526;
                color: #cccccc;

                font-family: inherit;
                font-size: 11px;

                transition: background 0.15s ease, color 0.15s ease;
            }

            .action-button {
                height: 30px;

                display: flex;
                align-items: center;
                justify-content: center;

                gap: 5px;

                border-radius: 3px;
            }

            .action-button:hover {
                background: #333333;
                color: #ffffff;
            }

            .support-button {
                width: 100%;
                height: 30px;

                margin-top: 4px;

                display: flex;
                align-items: center;
                justify-content: center;

                gap: 6px;

                border-radius: 3px;
            }

            .support-button:hover {
                background: #333333;
                color: #ffffff;
            }

            .codicon {
                font-size: 14px;
            }

            .footer {
                text-align: center;

                margin-top: 8px;

                font-size: 10px;
                color: #666666;
            }

            </style>
        </head>
        <body>

            <div class="container">

                <img
                    class="logo"
                    src="${logoUri}"
                    alt="CodeOut"
                >

                <div class="title">
                    CodeOut
                </div>

                <div class="subtitle">
                    Code outside the platform.
                </div>

                <div class="message">

                    <div class="message-title">
                        No problem selected
                    </div>

                    <div class="message-text">
                        Open a problem on LeetCode and
                        click the CodeOut extension button
                        to start coding here.
                    </div>

                </div>

                <div class="features">

                    <div class="feature">
                        <div class="check">✓</div>
                        <span>Sync code with LeetCode</span>
                    </div>

                    <div class="feature">
                        <div class="check">✓</div>
                        <span>Run test cases from VS Code</span>
                    </div>

                    <div class="feature">
                        <div class="check">✓</div>
                        <span>View test results</span>
                    </div>

                    <div class="feature">
                        <div class="check">✓</div>
                        <span>Submit directly to LeetCode</span>
                    </div>

                </div>

                <div class="footer">
                    LeetCode ↔ VS Code
                </div>
                ${getBottomActions()}
            </div>

            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();

                document.querySelectorAll("[data-action]").forEach((button) => {
                    button.addEventListener("click", () => {
                        vscode.postMessage({
                            command: "openLink",
                            target: button.getAttribute("data-action")
                        });
                    });
                });
            </script>

        </body>
        </html>
    `;
}

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    problem?: Problem,
    testResults?: {
        case: string;
        status: string;
        output: string;
    }[]
): string {
    const nonce = getNonce();
    const codiconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, "node_modules", "@vscode", "codicons", "dist", "codicon.css")
    );

    if (!problem) {
        return getWelcomeScreen(webview, extensionUri);
    }

    const difficulty = problem.difficulty ?? "Unknown";
    const difficultyClass = difficulty.toLowerCase();
    const idLabel = problem.questionFrontendId ? `${escapeHtml(problem.questionFrontendId)}. ` : "";
    const total = problem.testcases.length;

const casesHtml = problem.testcases
    .map((testcase, index) => {

        const input = escapeHtml(testcase.input);

        const expected = escapeHtml(
            testcase.expectedOutput ?? "Not available"
        );

        const testResult = testResults?.[index];

        const resultStatus = testResult?.status;
        const actualOutput = testResult?.output ?? "";

        const isRunning = resultStatus === "RUNNING";
        const isAccepted = resultStatus === "Accepted";

        const isWrongAnswer =
            resultStatus === "Wrong Answer" ||
            resultStatus === "Runtime Error" ||
            resultStatus === "Compile Error";

        let status: "pending" | "pass" | "fail" = "pending";
        let statusLabel = "READY";

        if (isRunning) {
            statusLabel = "RUNNING";
        } else if (isAccepted) {
            status = "pass";
            statusLabel = "ACCEPTED";
        } else if (isWrongAnswer) {
            status = "fail";
            statusLabel = resultStatus!.toUpperCase();
        }

        const collapsed = isAccepted ? "collapsed" : "";

        return `
            <div class="case status-${status} ${collapsed}">

                <button
                    class="case-header"
                    type="button"
                    aria-expanded="${isAccepted ? "false" : "true"}"
                >

                    <span class="case-header-left">

                        <i class="codicon codicon-chevron-down"></i>

                        <span class="case-label">
                            Test Case ${index + 1}
                        </span>

                    </span>

                    <span class="status-chip">

                        ${
                            isRunning
                                ? `<span class="loader"></span>`
                                : `<i class="codicon ${getStatusIcon(status)}"></i>`
                        }

                        ${statusLabel}

                    </span>

                </button>

                <div class="case-body">

                    <div class="field">

                        <div class="field-label">
                            <span>Input</span>

                            <button
                                class="copy-btn"
                                type="button"
                                data-copy="${input}"
                                title="Copy input"
                            >
                                <i class="codicon codicon-copy"></i>
                            </button>

                        </div>

                        <pre>${input}</pre>

                    </div>

                    <div class="field">

                        <div class="field-label">
                            <span>Expected Output</span>

                            <button
                                class="copy-btn"
                                type="button"
                                data-copy="${expected}"
                                title="Copy expected output"
                            >
                                <i class="codicon codicon-copy"></i>
                            </button>

                        </div>
                    </div>
                    <pre>${expected}</pre>

                    <div class="field">
                        <div class="field-label">
                            <span>Your Output</span>
                            ${
                                actualOutput
                                    ? `
                                        <button
                                            class="copy-btn"
                                            type="button"
                                            data-copy="${escapeHtml(actualOutput)}"
                                            title="Copy output"
                                        >
                                            <i class="codicon codicon-copy"></i>
                                        </button>
                                    `
                                    : ""
                            }
                        </div>

                        <pre>${escapeHtml(actualOutput || "No output")}</pre>

                    </div>

                </div>
                </div>
        `;
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

    .loader {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(99, 179, 237, 0.25);
        border-top-color: var(--co-blue);
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
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
    .bottom-section {
        flex-shrink: 0;

        padding: 6px 6px 8px;

        background: #1e1e1e;
    }
    .action-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 4px;
    }

    .action-button,
    .support-button {
        border: none;
        outline: none;
        cursor: pointer;

        background: #2d2d2d;
        color: #cccccc;

        font-family: inherit;
        font-size: 11px;

        transition:
            background 0.15s ease,
            color 0.15s ease;
    }

    .action-button {
        height: 30px;

        display: flex;
        align-items: center;
        justify-content: center;

        gap: 5px;

        border-radius: 3px;
    }

    .support-button {
        width: 100%;
        height: 30px;

        margin-top: 4px;

        display: flex;
        align-items: center;
        justify-content: center;

        gap: 6px;

        border-radius: 3px;
    }

    .action-button:hover,
    .support-button:hover {
        background: #3a3a3a;
        color: #ffffff;
    }

    .codicon {
        font-size: 14px;
    }

    .footer {
        margin-top: 6px;

        text-align: center;

        font-size: 10px;
        color: #666666;
    }
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
            <span class="badge-difficulty ${difficultyClass}">
                ${escapeHtml(difficulty)}
            </span>
            <span class="case-count">${total} Test Case${total === 1 ? "" : "s"}</span>
        </div>
    </div>

    <div class="cases">
        ${casesHtml}
    </div>

    <div class="actions">
        <button id="runBtn" class="btn btn-run" type="button"><i class="codicon codicon-play"></i>Run</button>
        <button id="submitBtn" class="btn btn-submit" type="button"><i class="codicon codicon-cloud-upload"></i>Submit</button>
        <button id="syncBtn" class="btn btn-run" type="button"><i class="codicon codicon-sync"></i>Sync Code</button>
    </div>
    ${getBottomActions()}

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

        window.addEventListener("message", (event) => {
            if (event.data.command === "runTests") {
                vscode.postMessage({
                    command: "runTests"
                });
            }

            if (event.data.command === "submit") {
                vscode.postMessage({
                    command: "submit"
                });
            }
        });

        const runBtn = document.getElementById("runBtn");

        runBtn.addEventListener("click", () => {
            vscode.postMessage({
                command: "runTests"
            });
        });
        const syncBtn = document.getElementById("syncBtn");

        syncBtn.addEventListener("click", () => {
            vscode.postMessage({
                command: "syncCode"
            });
        });
        const submitBtn = document.getElementById("submitBtn");
        submitBtn.addEventListener("click", () => {
            vscode.postMessage({
                command: "submit"
            });
        });
        document.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", () => {
                vscode.postMessage({
                    command: "openLink",
                    target: button.getAttribute("data-action")
                });
            });
        });
    </script>
</body>
</html>`;
}