module.exports = {
    /**
     * 
     * @param {(err) => void} callback 
     * @returns The synchronizer object
     */
    sync(callback) {
        return {
            err: false,
            depth: 0,
            enter() {
                this.depth += 1;
            },
            exit(err=null) {
                if (err) {
                    this.error(err);
                    return;
                }
                this.depth -= 1;
                if (this.depth == 0 && !this.err) {
                    callback(null);
                }
            },
            error(err) {
                if (!this.err) {
                    this.err = true; 
                    callback(err);
                }
            }
        };
    }
} 