const path = require('path');
const vscode = require('vscode');

class FileManager {

    pathToMelina = '/Users/ayakimenko/Library/Developer/Xcode/DerivedData/Melina-gujzuyepzrnbjubvknfeprmfuzmi/Build/Products/Debug/Melina'
    projectFolder = '/Users/ayakimenko/Documents/Projects/Swift/MelinaTestMachine/MelinaTestMachine/'
    testPlanFilePath = this.projectFolder + 'MelinaTestMachine.xctestplan'
    projectFilePath =  this.projectFolder + 'MelinaTestMachine.xcodeproj'

    currentFilePath() {
        return new URL(vscode.window.activeTextEditor.document.uri).pathname;
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