const fs = require('fs');
const path = require('path');
const parseMD = require('parse-md').default;
const marked = require('marked');
const async = require('./async');

const data = path.resolve(__dirname, "../data");


/**
 * 
 * @param {string} dir 
 * @param {(error: NodeJS.ErrnoException, items: {files: Array<string>, folders: Array<string>}) => void} callback 
 */
function list_dir(dir, callback) {
    let items = {
        folders: [],
        files: []
    };
    let sync = async.sync((err) => {
        callback(err, items);
    });

    fs.readdir(dir, (err, files) => {
        if (err) {
            sync.error(err);
            return;
        }

        for (let file of files) {
            sync.enter();
            fs.stat(path.resolve(dir, file), (err, stats) => {
                if (err) {
                    sync.error(err);
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
    });
}

/**
 * 
 * @param {string} file 
 * @param {(error: NodeJS.ErrnoException, json: object) => void} callback 
 */
function read_json(file, callback) {
    fs.readFile(file, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        let json = JSON.parse(data.toString());
        callback(null, json);
    });
}

/**
 * 
 * @param {string} file 
 * @param {object} json 
 * @param {(error: NodeJS.ErrnoException) => void} callback 
 */
function write_json(file, json, callback) {
    fs.writeFile(file, JSON.stringify(json, null, 2), callback);
}

/**
 * 
 * @param {string} file 
 * @param {(error, metadata: object, content: string) => void} callback 
 */
function read_markdown(file, callback, baseUrl) {
    fs.readFile(file, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        let markdown = parseMD(data.toString());
        marked.parse(markdown.content, {
            baseUrl,
            gfm: true
        }, (err, result) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, markdown.metadata, result);
        });
    });
}

/**
 * 
 * @param {string} folder 
 * @param {(error: NodeJS.ErrnoException, data: object) => void} callback 
 */
function list_date_files(folder, callback) {
    let data = {};
    let sync = async.sync((err) => {
        callback(err, data);
    });

    sync.enter();
    list_dir(folder, (err, years) => {
        if (err) {
            sync.error(err);
            return;
        }
        for (let year of years.folders) {
            sync.enter();
            list_dir(path.resolve(folder, year), (err, months) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                for (let month of months.folders) {
                    sync.enter();
                    list_dir(path.resolve(folder, year, month), (err, days) => {
                        if (err) {
                            sync.error(err);
                            return;
                        }
                        for (let day of days.folders) {
                            sync.enter();
                            list_dir(path.resolve(folder, year, month, day), (err, files) => {
                                if (err) {
                                    sync.error(err);
                                    return;
                                }
                                let date = `${year}/${month}/${day}`;
                                data[date] = files.files;
                                sync.exit();
                            });
                        }
                        sync.exit();
                    });
                }
                sync.exit();
            });
        }
        sync.exit();
    });
}

/**
 * 
 * @param {object} settings 
 * @param {(error) => void} callback 
 */
function load_updates(settings, callback) {
    fs.access(path.resolve(settings.path, "updates"), (err) => {
        if (err) {
            callback(null);
            return;
        }
        let sync = async.sync((err) => {
            callback(err);
        });
        settings.updates = []
        list_date_files(path.resolve(settings.path, 'updates'), (err, updates) => {
            if (err) {
                sync.error(err);
                return;
            }
            for (let [date, files] of Object.entries(updates)) {
                for (let file of files) {
                    let update = {
                        dest: path.resolve(settings.dest, 'updates', date, file.replace(/\..*/, '')),
                        date: date,
                        path: path.resolve(settings.path, 'updates', date, file),
                        content: null
                    };
                    settings.updates.push(update);

                    sync.enter();
                    read_markdown(update.path, (err, metadata, content) => {
                        if (err) {
                            sync.error(err);
                            return;
                        }
                        for (let [k, v] of Object.entries(metadata)) {
                            update[k] = v
                        }
                        update.content = content;
                        sync.exit();
                    });
                }
            }
        });
    });
}


/**
 * 
 * @param {(error, projects: object) => void} callback 
 */
function load_sites(callback) {
    let projects = {};
    let sync = async.sync((err) => {
        callback(err, projects);
    });
    list_dir(data, (err, items) => {
        if (err) {
            sync.error(err);
        }
        for (let name of items.folders) {
            let folder = path.resolve(data, name);
            projects[name] = {
                path: folder,
                dest: `/projects/${name}/`
            };

            sync.enter();
            read_markdown(path.resolve(folder, "project.md"), (err, metadata, content) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                for ([k, v] of Object.entries(metadata)) {
                    projects[name][k] = v;
                }
                projects[name].project = content;
                sync.exit();
            }, projects[name].dest);
            sync.enter();
            read_markdown(path.resolve(folder, "summary.md"), (err, metadata, content) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                projects[name].summary = content;
                sync.exit();
            }, '/');
            sync.enter();
            read_json(path.resolve(folder, "cache.json"), (err, json) => {
                if (err) {
                    if (err.code != 'ENOENT') {
                        sync.error(err);
                    } else {
                        sync.exit();
                    }
                    return;
                }
                projects[name].cache = json;
                sync.exit();
            });
            sync.enter();
            load_updates(projects[name], (err) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                sync.exit();
            });
        }
    });
}


module.exports = {
    load_sites
};
