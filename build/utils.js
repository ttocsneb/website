const path = require('path');
const fs = require('fs');

const parseMD = require('parse-md').default;
const yaml = require('js-yaml');

/**
 * 
 * @param {(sync: {enter: () => void, exit: (err: any?) => void}) => void} executor 
 * @param {() => any} on_complete 
 * @returns {Promise} promise
 */
function synchronize(executor, on_complete) {
    return new Promise((resolve, reject) => {
        let obj = {
            err: false,
            calls: 0,
            enter() {
                this.calls += 1;
            },
            exit(err=undefined) {
                if (this.err) {
                    return;
                }
                if (err) {
                    this.err = true;
                    reject(err);
                    return;
                }
                this.calls -= 1;
                if (this.calls == 0) {
                    resolve(on_complete());
                }
            }
        };
        executor(obj);
    });
}

/**
 * List directories and files in a directory
 * @param {string} dir 
 * @return {Promise<{folders: Array<string>, files: Array<string>}>} promise
 */
function list_dir(dir) {
    let items = {
        folders: [],
        files: []
    }
    return synchronize(sync => {
        sync.enter();
        fs.readdir(dir, (err, files) => {
            if (err) {
                sync.exit(err);
                return;
            }

            for (let file of files) {
                sync.enter();
                fs.stat(path.resolve(dir, file), (err, stats) => {
                    if (err) {
                        sync.exit(err);
                        return;
                    }

                    if (stats.isDirectory()) {
                        items.folders.push(file);
                    } else if (stats.isFile()) {
                        items.files.push(file);
                    }

                    sync.exit();
                });
            }
            sync.exit();
        });
    }, () => {
        return items;
    });
}

/**
 * Check if a path exists
 * 
 * @param {string} file 
 * @returns {Promise<boolean>} promise
 */
function exists(file) {
    return new Promise((resolve, reject) => {
        fs.access(file, (err) => {
            if (err) {
                resolve(false);
                return;
            }
            resolve(true);
        })
    });
}

/**
 * Get the stats of a file
 * 
 * @param {string} file 
 * @returns {Promise<fs.Stats>} stats
 */
function stat(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stats) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stats);
        });
    });
}

/**
 * Read a file from disk
 * 
 * @param {string} file 
 * @returns {Promise<string>} read file
 */
function read_file(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(String(data));
        })
    });
}

/**
 * Write a file to disk
 * 
 * @param {string} file 
 * @param {string} content 
 * @returns {Promise<void>}
 */
function write_file(file, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * make directory
 * 
 * @param {string} path 
 * @returns {Promise<void>}
 */
function mkdir(path) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, {
            recursive: true
        }, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * Read markdown from a file
 * 
 * @param {string} file 
 * @return {Promise<{metadata: object, content: string}>} promise
 */
async function read_markdown(file) {
    let content = await read_file(file);
    return parseMD(content);
}

/**
 * Write markdown to a file
 * 
 * @param {string} file 
 * @param {string} content 
 * @param {object?} metadata 
 * @return {Promise<null>} promise
 */
async function write_markdown(file, content, metadata=null) {
    let output = '';
    if (metadata && Object.keys(metadata).length > 0) {
        let header = yaml.dump(metadata)
        output += `---\n${header}---\n`;
    }
    output += content;
    await write_file(file, output);
}


module.exports = {
    synchronize,
    list_dir,
    exists,
    stat,
    mkdir,
    write_file,
    read_file,
    write_markdown,
    read_markdown
}