const vscode = require('vscode');
const BuildController = require('./BuildController.js');
const CodeFormatter = require('./CodeFormatter.js');
const FileManager = require('./FileManager.js');

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
            const conditionTypePattern = /\b(not selected|selected|not exists|exists|contains|with)\b/;
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
            const keywords = [
                'suite', 'scenario', 'subscenario', 'arguments', 'end', 'to', 'verify', 'tap', 'edit',
                'button', 'view', 'textfield', 'label', 'not selected', 'selected', 
                'not exists', 'exists', 'contains', 'with', 'json', 'file'
              ];
              
              return keywords.map(keyword => new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword));
        }
    }
);

let output = vscode.window.createOutputChannel("Melina compiler");

let generateCommand = 'extension.generate';
let generateDisposable = vscode.commands.registerCommand(generateCommand, async function () {
    let buildController = new BuildController();

    buildController.generate()
        .then(result => {
            output.show()
            output.append(result);
        })
        .catch(error => {
            output.show()
            output.append(error);
        });
});

let templateCommand = 'extension.template';
let templateDisposable = vscode.commands.registerCommand(templateCommand, async function () {
    let fm = new FileManager()
    fm.createTemplateFile((error, filePath) => {
        if (error) {
            vscode.window.showInformationMessage(error.message);
        } else {
            vscode.workspace.openTextDocument(filePath).then((doc) => {
                vscode.window.showTextDocument(doc);
            });
        }
    })
});

let runCommand = 'extension.run';
let runDisposable = vscode.commands.registerCommand(runCommand, async function () {
    let buildController = new BuildController();

    buildController.run()
        .then(result => {
            output.show()
            output.append(result);
        })
        .catch(error => {
            output.show()
            output.append(error);
        });
});

let buildAndRunCommand = 'extension.build-and-run';
let buildAndRunDisposable = vscode.commands.registerCommand(buildAndRunCommand, async function () {
    let buildController = new BuildController();

    buildController.buildAndRun()
        .then(result => {
            output.show()
            output.append(result);
        })
        .catch(error => {
            output.show()
            output.append(error);
        });
});

function activate(context) {
    let generateItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    generateItem.command = generateCommand;
    generateItem.text = `$(file-code)`;
    generateItem.tooltip = 'Generate test';
    generateItem.show();

    let templateItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    templateItem.command = templateCommand;
    templateItem.text = `$(file-add)`;
    templateItem.tooltip = 'Create template';
    templateItem.show();

    let runItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    runItem.command = runCommand;
    runItem.text = `$(run)`;
    runItem.tooltip = 'Run test';
    runItem.show();

    let buildAndRunItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    buildAndRunItem.command = buildAndRunCommand;
    buildAndRunItem.text = `$(debug-rerun)`;
    buildAndRunItem.tooltip = 'Build and run test';
    buildAndRunItem.show();

    context.subscriptions.push(hoverDisposable)
    context.subscriptions.push(completionDisposable)
    context.subscriptions.push(runDisposable)
    context.subscriptions.push(generateDisposable)
    context.subscriptions.push(templateDisposable)
    context.subscriptions.push(formatCodeDisposable)
    context.subscriptions.push(buildAndRunDisposable)
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