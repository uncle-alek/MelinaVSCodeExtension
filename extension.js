const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
    let statusBarCommand = 'extension.melinaStatusBarAction';
    let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBar.command = statusBarCommand;
    statusBar.text = `$(play)`;
    statusBar.tooltip = 'Run test';
    statusBar.show();
    context.subscriptions.push(statusBar);

    let disposable = vscode.commands.registerCommand(statusBarCommand, function () {
        vscode.window.showInformationMessage('Melina Action Invoked!');
        
        let pathToMelina = '/Users/Debug/Melina'
        let pathToCurrentFile = new URL(vscode.window.activeTextEditor.document.uri).pathname;
        exec(`${pathToMelina} --path ${pathToCurrentFile}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error}`);
            }
    
            if(stderr){
                console.error(`Error: ${stderr}`);
            }

            let xcodeUItests = 'xcodebuild \
            -project /Users/project.xcodeproj \
            -scheme App \
            -destination "platform=iOS Simulator,name=iPhone 14 pro,OS=16.4" test-without-building'
            exec(xcodeUItests,  { maxBuffer: 1024 * 5000 }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing second command: ${error}`);
                }
                
                if(stderr) {
                    console.error(`Error in second command: ${stderr}`);
                }
                
                console.log(`Output of second command: ${stdout}`);
            });

            console.log(`Output: ${stdout}`);
        });
        
        // Assuming you have function named 'runCompiler' which return array of compiler errors
        let compilerErrors = [{
            errorMessage: "Compilation error",
            startLine: 3,
            startCharacter: 0,
            endLine: 3,
            endCharacter: 20
        }];
        let diagnostics = [];

        for (let error of compilerErrors) {
            if (error.errorMessage && typeof error.errorMessage === 'string') {
                let range = new vscode.Range(error.startLine, error.startCharacter, error.endLine, error.endCharacter);
                let diagnostic = new vscode.Diagnostic(range, error.errorMessage, vscode.DiagnosticSeverity.Error);
                diagnostics.push(diagnostic);
            } else {
                vscode.window.showInformationMessage(`An error was found without an acceptable errorMessage: ${JSON.stringify(error)}`);
            }
        }

        diagnosticCollection.clear();
        diagnosticCollection.set(pathToCurrentFile, diagnostics);
    });

    diagnosticCollection = vscode.languages.createDiagnosticCollection("melina");
    context.subscriptions.push(disposable);

    // Registering completion item provider for 'melina' language    
    const provider = vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language: 'melina' },
        {
            provideCompletionItems(document, position, token, context) {
                // You can add your logic here to provide specific completion item based on context
                // In this example, a simple completion item 'meliCompletion' is provided
                const suite = new vscode.CompletionItem('suite', vscode.CompletionItemKind.Method);
                const arguments = new vscode.CompletionItem('arguments', vscode.CompletionItemKind.Method);
                const scenario = new vscode.CompletionItem('scenario', vscode.CompletionItemKind.Method);
                const end = new vscode.CompletionItem('end', vscode.CompletionItemKind.Method);
                return [suite, arguments, scenario, end];
            }
        }
    );

    context.subscriptions.push(provider); // don't forget to push your provider to context subscriptions

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