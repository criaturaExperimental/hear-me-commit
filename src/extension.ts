'use strict';
import * as vscode from 'vscode';

const copyPaste = require('copy-paste');

export function activate(context: vscode.ExtensionContext) {

    let simpleGit;
    try {
        simpleGit = require('simple-git')(vscode.workspace.workspaceFolders[0].uri.fsPath);
    } catch (error) {
        console.error('Couldn\'t find git repository');
    }

    console.log('Congratulations, your extension "hear-me-commit" is now active!');

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
                const jira = getJira(data.current);
                jira &&
                vscode.window.showInputBox().then( msg => {
                    const output = `[${jira}] ${msg}`;
                    output && copyPaste.copy(output, () => console.log(output));
                });
            }
        });
        function getJira(data:string) {
            const str = data;
            const branch = /CL-\d*/;
            if (branch.test(str)) {
                const jira = str.match(branch);
                return jira;
            } else {
                vscode.window.showErrorMessage('Are you sure you are in the right branch? Not Jira found');
                return false;
            }
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
}