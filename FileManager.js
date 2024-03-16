const path = require('path');
const fs = require('fs');
const vscode = require('vscode');

let _currentFilePath = '';
updateCurrentFilePath(vscode.window.activeTextEditor.document);
vscode.window.onDidChangeActiveTextEditor(editor => {
    updateCurrentFilePath(editor.document);
});

function updateCurrentFilePath(document) {
    if(document.uri.fsPath.endsWith('.melina')) {
        _currentFilePath = document.uri.fsPath;
    }
}

class FileManager {

    constructor() {
        this.projectFolder = '/Users/ayakimenko/Documents/Projects/Swift/MelinaTestMachine/MelinaTestMachine/';
        this.testPlanFilePath = this.projectFolder + 'MelinaTestMachine.xctestplan';
        this.projectFilePath =  this.projectFolder + 'MelinaTestMachine.xcodeproj';
        this.pathToMelina = path.join(__dirname, 'bin', 'Melina')
        this.pathToTemplate = path.join(__dirname, 'templates', 'NewSuite.melina')
    }

    currentFilePath() {
        return _currentFilePath;
    }

    compiledFilePath() {
        let parsedPath = path.parse(this.currentFilePath());
        let newPath = path.format({
            dir: parsedPath.dir,
            name: parsedPath.name + "Generated",
            ext: ".tecode.json"
        });
        return newPath
    }

    createTemplateFile(completion) {
        let editor = vscode.window.activeTextEditor;
        let currentFileDir = path.dirname(editor.document.uri.fsPath);
        let newFilePath = path.join(currentFileDir, 'NewSuite.melina');
        if (fs.existsSync(newFilePath)) {
            console.debug('already exists')
            completion(new Error('File `NewSuite.melina` already exists'), null)
        } else {
            fs.readFile(this.pathToTemplate, 'utf8', (readError, data) => {
                if (readError) {
                    completion(readError, null);
                } else {
                    fs.writeFile(newFilePath, data, (writeError) => {
                        if (writeError) {
                            completion(writeError, null);
                        } else {
                            completion(null, newFilePath);
                        }
                    });
                }
            });
        }
    }
}

module.exports = FileManager;