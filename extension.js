const vscode = require('vscode');
const FileManager = require('./FileManager.js');
const MelinaCompiler = require('./MelinaCompiler.js');
const XCTestPlan = require('./XCTestPlan.js');
const XCodeBuild = require('./XCodeBuild.js');

let fm = new FileManager()

function activate(context) {
    let statusBarCommand = 'extension.melinaStatusBarAction';
    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = statusBarCommand;
    statusBar.text = `$(play)`;
    statusBar.tooltip = 'Run test';
    statusBar.show();
    context.subscriptions.push(statusBar);

    let disposable = vscode.commands.registerCommand(statusBarCommand, async function () {       
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

    context.subscriptions.push(disposable);    

    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'melina' },
        {
            provideCompletionItems(document, position, token, context) {
                const suite = new vscode.CompletionItem('suite', vscode.CompletionItemKind.Method);
                const args = new vscode.CompletionItem('arguments', vscode.CompletionItemKind.Method);
                const scenario = new vscode.CompletionItem('scenario', vscode.CompletionItemKind.Method);
                const end = new vscode.CompletionItem('end', vscode.CompletionItemKind.Method);
                return [suite, args, scenario, end];
            }
        }
    );

    context.subscriptions.push(provider);
}
exports.activate = activate;

function deactivate() {
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}

module.exports = {
    activate,
    deactivate
};