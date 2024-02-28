const fs = require('fs');

class XCTestPlan {

    constructor(testPlanFilePath) {
      this.testPlanFilePath = testPlanFilePath;
    }
  
    async updateConfiguration(compiledFilePath) {
        const jsonString = await fs.promises.readFile(this.testPlanFilePath, 'utf8');
        const obj = JSON.parse(jsonString);
        obj.configurations.forEach(config => {
            const envVar = config.options.environmentVariableEntries;
            const idx = envVar.findIndex(entry => entry.key === "TECODE_PATH");

            if (idx >= 0) {
                envVar[idx].value = compiledFilePath;
            } else {
                envVar.push({ "key": "TECODE_PATH", "value": compiledFilePath });
            }
        });
        const updatedJsonString = JSON.stringify(obj, null, 2);
        
        await fs.promises.writeFile(this.testPlanFilePath, updatedJsonString)
    }
  }
  
  module.exports = XCTestPlan;