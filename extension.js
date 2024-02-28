const vscode = require('vscode');
const FileManager = require('./FileManager.js');
const MelinaCompiler = require('./MelinaCompiler.js');
const XCTestPlan = require('./XCTestPlan.js');
const XCodeBuild = require('./XCodeBuild.js');

let fm = new FileManager()

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

let statusBarCommand = 'extension.melinaStatusBarAction';
let statusBarDisposable = vscode.commands.registerCommand(statusBarCommand, async function () {
    try {
        const { stdout, stderr } = await new MelinaCompiler(fm.pathToMelina).compileFileWith(fm.currentFilePath(), fm.compiledFilePath())
        vscode.window.showInformationMessage('Build success');
        await new XCTestPlan(fm.testPlanFilePath).updateConfigurationWith(fm.compiledFilePath())
        new XCodeBuild(fm.projectFilePath).test()
        vscode.window.showInformationMessage('Running UITests');
    } catch (error) {
        console.error('Error occured:', error);
    }
});

function activate(context) {
    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = statusBarCommand;
    statusBar.text = `$(play)`;
    statusBar.tooltip = 'Run test';
    statusBar.show();

    context.subscriptions.push(hoverDisposable)
    context.subscriptions.push(completionDisposable)
    context.subscriptions.push(statusBarDisposable)
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