// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import * as cmd from "commands";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    let disposable: vscode.Disposable;

    disposable = vscode.commands.registerCommand(
        "tempest.newFile",
        cmd.newFile
    );
    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
