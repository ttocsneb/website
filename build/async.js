module.exports = {
    sync(callback) {
        return {
            err: false,
            depth: 0,
            enter() {
                this.depth += 1;
            },
            exit() {
                this.depth -= 1;
                if (this.depth == 0 && !this.err) {
                    callback(null);
                }
            },
            error(error) {
                if (!this.err) {
                    this.err = true; 
                    callback(error);
                }
            }
        };
    }
} 