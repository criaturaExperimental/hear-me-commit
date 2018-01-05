'use strict';
import * as vscode from 'vscode';

const copyPaste = require('copy-paste');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let simpleGit;
    try {
        simpleGit = require('simple-git')(vscode.workspace.workspaceFolders[0].uri.fsPath);
    } catch (error) {
        console.error('Couldn\'t find git repository');
    }

    console.log('Congratulations, your extension "hear-me-commit" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.copyBracketedJira', () => {
        if (!simpleGit) {
            vscode.window.showErrorMessage('This is not a git repository')
            console.error('Failed to create commit message: This is not a git repository');
            return;
        }
        simpleGit.branchLocal((error, data) => {
            if (error) {
                console.error(error);
            } else {
                const output = getBracketedJira(data.current);
                output && copyPaste.copy(output, () => console.log(output));
            }
        });
        function getBracketedJira(data:string) {
            const str = data;
            const branch = /CL-\d*/;
            if (branch.test(str)) {
                const jira = str.match(branch);
                vscode.window.showInformationMessage(`EUREKA!! A bracketed Jira was copied to your clipboard`);
                return `[${jira}]`;
            } else {
                vscode.window.showErrorMessage('Are you sure you are in the right branch? Not Jira found');
                return false;
            }
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}