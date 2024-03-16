class CodeFormatter {

    indentation = 2;

    constructor() {
        this.scopeLevel = 0;
        this.formattedCode = '';
    }

    format(code) {
        const lines = code.split("\n");

        lines.forEach(line => {
            if (this.isScopeEnd(line)) {
                this.scopeLevel = Math.max(this.scopeLevel - 1, 0);
            }

            this.formattedLine(line);

            if (this.isScopeStart(line)) {
                this.scopeLevel++;
            }
        });

        return this.formattedCode.trim();
    }

    isScopeStart(line) {
        return !!line.trim().match( /^(?!.*\/\/)([^"']*("[^"']*"[^"']*)*):(?![^"]*")\s*$/);
    }

    isScopeEnd(line) {
        return !!line.trim().match( /^(?!.*\/\/)([^"']*("[^"']*"[^"']*)*)end(?![^"]*")\s*$/);
    }

    formattedLine(line) {
        const prefix = ' '.repeat(this.scopeLevel * this.indentation);
        this.formattedCode += prefix + line.trimStart() + '\n';
    }
}

module.exports = CodeFormatter;