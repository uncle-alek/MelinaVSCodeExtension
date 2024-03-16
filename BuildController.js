const FileManager = require('./FileManager.js');
const MelinaCompiler = require('./MelinaCompiler.js');
const XCTestPlan = require('./XCTestPlan.js');
const XCodeBuild = require('./XCodeBuild.js');

class BuildController {

    fm = new FileManager()

    async generate() {
        const { stdout, stderr } = await new MelinaCompiler(this.fm.pathToMelina).compileSwift(this.fm.currentFilePath());
        let stdoutData = '';
        for await (const chunk of stdout) {
            stdoutData += chunk;
        }
        let stderrData = '';
        for await (const chunk of stderr) {
            stderrData += chunk;
        }
        if (stderrData) {
            throw new Error(stderrData);
        }
        return stdoutData;
    }

    async run() {
        const { stdout, stderr } = await new MelinaCompiler(this.fm.pathToMelina).compileSwiftTeCode(this.fm.currentFilePath());
        let stdoutData = '';
        for await (const chunk of stdout) {
            stdoutData += chunk;
        }
        let stderrData = '';
        for await (const chunk of stderr) {
            stderrData += chunk;
        }
        if (stderrData) {
            throw new Error(stderrData);
        }
        // await new XCTestPlan(this.fm.testPlanFilePath).updateConfiguration(this.fm.compiledFilePath());

        // new XCodeBuild(this.fm.projectFilePath).test();
        // completion(null, 'Running UITests');
        return stdoutData;
    }
}

module.exports = BuildController;