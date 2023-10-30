const { exec } = require('child_process');

class MelinaCompiler {

  constructor(pathToMelina) {
    this.pathToMelina = pathToMelina;
  }

  async compileFileWith(filePath, compiledFilePath) {
    return await exec(`${this.pathToMelina} -p ${filePath} -o ${compiledFilePath}`)
  }
}

module.exports = MelinaCompiler;