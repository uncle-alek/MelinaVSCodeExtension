class CodeFormatter {

    indentation = 2

    constructor() {
        this.scopeLevel = 0;
        this.formattedCode = '';
    }

    format(code) {
        const lines = code.split("\n");

        lines.forEach(line => {
            if (line.includes(':') && !line.includes('//')) {
                this.formattedLine(line)
                this.scopeLevel++;
            } else if (line.includes('end') && !line.includes('//')) {
                this.scopeLevel--;
                this.formattedLine(line)
            } else {
                this.formattedLine(line)
            }
        });

        return this.formattedCode;
    }

    formattedLine(line) {
        const trimmedLine = line.trimStart();
        const prefix = ' '.repeat(this.scopeLevel * this.indentation);
        this.formattedCode += prefix + trimmedLine + '\n'; 
    }
}

module.exports = CodeFormatter;