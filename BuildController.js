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
        const compiler = new MelinaCompiler(this.fm.pathToMelina)
        const { stdout, stderr } = await compiler.compileSwiftTeCode(this.fm.currentFilePath(), this.fm.compiledFilePath());
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
        await new XCTestPlan(this.fm.testPlanFilePath).updateConfiguration(this.fm.compiledFilePath());
        new XCodeBuild(this.fm.projectFilePath).testWithoutBuilding();

        return stdoutData;
    }

    async buildAndRun() {
        const compiler = new MelinaCompiler(this.fm.pathToMelina)
        const { stdout, stderr } = await compiler.compileSwiftTeCode(this.fm.currentFilePath(), this.fm.compiledFilePath());
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
        await new XCTestPlan(this.fm.testPlanFilePath).updateConfiguration(this.fm.compiledFilePath());
        new XCodeBuild(this.fm.projectFilePath).test();

        return stdoutData;
    }
}

module.exports = BuildController;