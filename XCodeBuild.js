const { exec } = require('child_process');

class XCodeBuild {

    constructor(projectFilePath) {
        this.projectFilePath = projectFilePath;
    }

    async test() {
        let xcodeUItests = `xcodebuild \
                    -project ${this.projectFilePath} \
                    -scheme MelinaTestMachine \
                    -testPlan MelinaTestMachine \
                    -destination "platform=iOS Simulator,name=iPhone 14 pro,OS=16.4" test`
        return await exec(xcodeUItests, { maxBuffer: 1024 * 5000 })
    }

    async testWithoutBuild() {
        let xcodeUItests = `xcodebuild \
                    -project ${this.projectFilePath} \
                    -scheme MelinaTestMachine \
                    -testPlan MelinaTestMachine \
                    -destination "platform=iOS Simulator,name=iPhone 14 pro,OS=16.4" test-without-building`
        return await exec(xcodeUItests, { maxBuffer: 1024 * 5000 })
    }
}

module.exports = XCodeBuild;