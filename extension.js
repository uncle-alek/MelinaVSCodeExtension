const vscode = require('vscode');
const BuildController = require('./BuildController.js');
const CodeFormatter = require('./CodeFormatter.js');

let formatCodeDisposable = vscode.commands.registerCommand('extension.formatCode', function () {
    const editor = vscode.window.activeTextEditor;
    const document = editor.document;
    const unformattedCode = document.getText();
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(unformattedCode.length));

    let formattedCode = new CodeFormatter().format(unformattedCode)
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange, formattedCode);
    vscode.workspace.applyEdit(edit);
});

let hoverDisposable = vscode.languages.registerHoverProvider('melina',
    {
        provideHover(document, position, token) {
            const definitionPattern = /(suite|subscenario)\s+"([^"]+)":|scenario\s+"([^"]+)":/;
            const argumentPattern = /"([^"]+)"\s+to\s+"([^"]+)"/;
            const actionPattern = /(verify|tap|edit)\s+(button|view|textfield|label)\s+"([^"]+)"/;
            const conditionTypePattern = /\b(is not selected|is selected|is not exist|is exist|contains value|with text)\b/;
            const subscenarioCallPattern = /subscenario\s+"([^"]+)"/;

            // Combine all patterns into an array
            const allPatterns = [definitionPattern, argumentPattern, actionPattern, conditionTypePattern, subscenarioCallPattern];

            let hoveredWord = '';

            // Iterate over each pattern and check if it matches the text at the current position
            allPatterns.some(pattern => {
                const wordRange = document.getWordRangeAtPosition(position, pattern);
                if (wordRange) {
                    hoveredWord = document.getText(wordRange).match(pattern)?.[0];
                    return true; // Stop iterating after the first match
                }
            });

            if (!hoveredWord) {
                return;
            }

            console.log("hoveredWord: ", hoveredWord);

            // Return the hover content, you can customize this as needed
            return new vscode.Hover(`You are hovering over: ${hoveredWord}`);
        }
    }
);

let completionDisposable = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'melina' },
    {
        provideCompletionItems(document, position, token, context) {
            const suite = new vscode.CompletionItem('suite', vscode.CompletionItemKind.Keyword);
            const scenario = new vscode.CompletionItem('scenario', vscode.CompletionItemKind.Keyword);
            const subscenario = new vscode.CompletionItem('subscenario', vscode.CompletionItemKind.Keyword);
            const arguments = new vscode.CompletionItem('arguments', vscode.CompletionItemKind.Keyword);
            const end = new vscode.CompletionItem('end', vscode.CompletionItemKind.Keyword);
            const to = new vscode.CompletionItem('to', vscode.CompletionItemKind.Keyword);
            const verify = new vscode.CompletionItem('verify', vscode.CompletionItemKind.Keyword);
            const tap = new vscode.CompletionItem('tap', vscode.CompletionItemKind.Keyword);
            const edit = new vscode.CompletionItem('edit', vscode.CompletionItemKind.Keyword);
            const button = new vscode.CompletionItem('button', vscode.CompletionItemKind.Keyword);
            const view = new vscode.CompletionItem('view', vscode.CompletionItemKind.Keyword);
            const textfield = new vscode.CompletionItem('textfield', vscode.CompletionItemKind.Keyword);
            const label = new vscode.CompletionItem('label', vscode.CompletionItemKind.Keyword);
            const isNotSelected = new vscode.CompletionItem('is not selected', vscode.CompletionItemKind.Keyword);
            const isSelected = new vscode.CompletionItem('is selected', vscode.CompletionItemKind.Keyword);
            const isNotExist = new vscode.CompletionItem('is not exist', vscode.CompletionItemKind.Keyword);
            const isExist = new vscode.CompletionItem('is exist', vscode.CompletionItemKind.Keyword);
            const containsValue = new vscode.CompletionItem('contains value', vscode.CompletionItemKind.Keyword);
            const withText = new vscode.CompletionItem('with text', vscode.CompletionItemKind.Keyword);
            const json = new vscode.CompletionItem('json', vscode.CompletionItemKind.Keyword);
            const file = new vscode.CompletionItem('file', vscode.CompletionItemKind.Keyword);

            return [
                suite, scenario, subscenario, arguments, end, to, verify, tap, edit,
                button, view, textfield, label, isNotSelected, isSelected,
                isNotExist, isExist, containsValue, withText, json, file
            ];
        }
    }
);

let output = vscode.window.createOutputChannel("Melina compiler");

let generateCommand = 'extension.generate';
let generateDisposable = vscode.commands.registerCommand(generateCommand, async function () {
    let buildController = new BuildController();

    buildController.generate((error, message) => {
        output.show()

        if (error) {
            output.append(error);
        } else {
            output.append(message);
        }
        vscode.window.showTextDocument(vscode.window.activeTextEditor.document, { selection: vscode.window.activeTextEditor.selection });
    })
});

let runCommand = 'extension.run';
let runDisposable = vscode.commands.registerCommand(runCommand, async function () {
    let buildController = new BuildController();

    buildController.run((error, message) => {
        output.show()

        if (error) {
            output.append(error);
        } else {
            output.append(message);
        }
        vscode.window.showTextDocument(vscode.window.activeTextEditor.document, { selection: vscode.window.activeTextEditor.selection });
    })
});

function activate(context) {
    let generateItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    generateItem.command = runCommand;
    generateItem.text = `$(file-code)`;
    generateItem.tooltip = 'Generate test';
    generateItem.show();

    let runItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    runItem.command = runCommand;
    runItem.text = `$(play)`;
    runItem.tooltip = 'Run test';
    runItem.show();

    context.subscriptions.push(hoverDisposable)
    context.subscriptions.push(completionDisposable)
    context.subscriptions.push(runDisposable)
    context.subscriptions.push(generateDisposable)
    context.subscriptions.push(formatCodeDisposable);
}

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};