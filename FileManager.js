const path = require('path');
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
}

module.exports = FileManager;