const { exec } = require('child_process');

class XCodeBuild {

    simulatorName = `iPhone 15`
    OS = `17.0.1`

    constructor(projectFilePath) {
        this.projectFilePath = projectFilePath;
    }

    async test() {
        return await this.runXCodebuild(`test`)
    }

    async testWithoutBuilding() {
        return await this.runXCodebuild(`test-without-building`)
    }

    async runXCodebuild(option) {
        let xcodeUItests = `xcodebuild \
                    -project ${this.projectFilePath} \
                    -scheme MelinaTestMachine \
                    -testPlan MelinaTestMachine \
                    -destination "platform=iOS Simulator,name=${this.simulatorName},OS=${this.OS}" ${option}`
        return await exec(xcodeUItests, { maxBuffer: 1024 * 5000 })
    }
}

module.exports = XCodeBuild;