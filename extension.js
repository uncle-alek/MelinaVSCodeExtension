const vscode = require('vscode');
const BuildController = require('./BuildController.js');

let alignCodeDisposable = vscode.commands.registerCommand('extension.alignCode', function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }

    const document = editor.document;
    const selection = editor.selection;

    // Perform the alignment here using your custom logic
    alignCode(editor, document, selection);
});

function alignCode(editor, document, selection) {
    // Implement your alignment logic
    // For instance, identify key characters like '=', ':', or '=>',
    // and add or remove spaces to/from lines to align them accordingly.

    // You might need to use regular expressions to identify
    // the points to align and calculate the necessary spaces.
    // Then create a new vscode.WorkspaceEdit to apply the changes.

    console.debug(selection)

    const edit = new vscode.WorkspaceEdit();
    // This is a demostration line to set a replace operation
    // Replace with your actual code to adjust alignment
    edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), alignedText);

    // Apply the WorkspaceEdit to the document
    return vscode.workspace.applyEdit(edit);
}

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

            return [
                suite, scenario, subscenario, arguments, end, to, verify, tap, edit,
                button, view, textfield, label, isNotSelected, isSelected,
                isNotExist, isExist, containsValue, withText
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
    context.subscriptions.push(alignCodeDisposable);
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