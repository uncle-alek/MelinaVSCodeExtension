const { exec } = require('child_process');

class MelinaCompiler {

  constructor(pathToMelina) {
    this.pathToMelina = pathToMelina;
  }

  async compileSwift(filePath, outputPath = null) {
    return await this.compile(filePath, `swift`, outputPath)
  }

  async compileSwiftTeCode(filePath, outputPath = null) {
    return await this.compile(filePath, `swiftTeCode`, outputPath)
  }

  async compile(filePath, language, outputPath) {
    let command = `${this.pathToMelina} -p ${filePath} -l ${language}`
    if (outputPath != null) {
      command += ` -o ${outputPath}`
    }
    return await exec(command);
  }
}

module.exports = MelinaCompiler;