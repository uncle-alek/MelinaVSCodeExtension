const FileManager = require('./FileManager.js');
const MelinaCompiler = require('./MelinaCompiler.js');
const XCTestPlan = require('./XCTestPlan.js');
const XCodeBuild = require('./XCodeBuild.js');

const fs = require('fs').promises;

class BuildController {

    fm = new FileManager()

    async run(completion) {
        try {
            const { stdout, stderr } = await new MelinaCompiler(this.fm.pathToMelina).compileSwift(this.fm.currentFilePath());
            if (stdout.on) {
                let stdoutData = '';
                stdout.on('data', (chunk) => {
                    stdoutData += chunk;
                });
                stdout.on('end', () => {
                    completion(null, stdoutData);
                });
            }

            if (stderr.on) {
                let stderrData = '';
                stderr.on('data', (chunk) => {
                    stderrData += chunk;
                });
                stderr.on('end', () => {
                    completion(stderrData, null);
                });
            }

            // await new XCTestPlan(this.fm.testPlanFilePath).updateConfiguration(this.fm.compiledFilePath());

            // new XCodeBuild(this.fm.projectFilePath).test();
            // completion(null, 'Running UITests');
        } catch (error) {
            console.error('Error occured:', error);
            completion(error, null);
        }
    }
}

module.exports = BuildController;