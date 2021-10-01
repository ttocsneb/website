const fs = require('fs');
const path = require('path');
const parseMD = require('parse-md').default;
const marked = require('marked');
const async = require('./async');
const yaml = require('js-yaml');

const data = path.resolve(__dirname, "../data");

/**
 * List directories and files in a directory
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
 * Read markdown from a file
 * 
 * @param {string} file 
 * @param {(error: NodeJS.ErrnoException, metadata: object, content: string) => void} callback 
 */
function read_markdown(file, callback) {
    fs.readFile(file, (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        let markdown = parseMD(data.toString());
        callback(null, markdown.metadata, markdown.content);
    });
}

/**
 * Write markdown to a file
 * 
 * @param {string} file 
 * @param {string} content 
 * @param {object} metadata 
 * @param {(err: NodeJS.ErrnoException) => void} callback 
 */
function write_markdown(file, content, metadata=null, callback) {
    let output = '';
    if (metadata && Object.keys(metadata).length > 0) {
        let header = yaml.dump(metadata)
        output += `---\n${header}---\n`;
    }
    output += content;
    fs.writeFile(file, output, (err) => {
        callback(err);
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
                        content: null,
                        metadata: null
                    };
                    settings.updates.push(update);

                    sync.enter();
                    read_markdown(update.path, (err, metadata, content) => {
                        if (err) {
                            sync.error(err);
                            return;
                        }
                        update.metadata = metadata;
                        update.content = content;
                        sync.exit();
                    });
                }
            }
        });
    });
}


/**
 * Load the projects from disk.
 * 
 * @param {(error, projects: object) => void} callback 
 */
function load_projects(callback) {
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
                dest: `/projects/${name}/`,
                updates: []
            };
            let project = projects[name];

            sync.enter();
            read_markdown(path.resolve(folder, "project.md"), (err, metadata, content) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                project.project = {
                    content,
                    metadata
                };
                sync.exit();
            }, projects[name].dest);
            sync.enter();
            read_markdown(path.resolve(folder, "summary.md"), (err, metadata, content) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                project.summary = {
                    metadata,
                    content
                };
                sync.exit();
            });
            sync.enter();
            load_updates(project, (err) => {
                if (err) {
                    sync.error(err);
                    return;
                }
                sync.exit();
            });
        }
    });
}

/**
 * 
 * @param {object} project 
 * @param {(err) => void} callback 
 */
function save_updates(project, callback) {
    let sync = async.sync(callback);
    let folder = project.path;
    sync.enter();
    write_markdown(path.resolve(folder, "project.md"), project.project.content, project.project.metadata, sync.exit);
    sync.enter();
    write_markdown(path.resolve(folder, "summary.md"), project.summary.content, project.summary.metadata, sync.exit);
    if (!project.updates) {
        return;
    }
    for (let update of project.updates) {
        sync.enter();
        write_markdown(update.path, update.content, update.metadata, sync.exit);
    }
}

/**
 * Save the projects cache
 * 
 * @param {object} projects 
 * @param {(err) => void} callback 
 */
function save_projects(projects, callback) {
    let sync = async.sync((err) => {
        callback(err);
    });
    for (let [name, project] of Object.entries(projects)) {
        sync.enter();
        save_updates(project, (err) => {
            if (err) {
                sync.error(err);
            }
            sync.exit();
        })
    }
}


module.exports = {
    load_projects,
    save_projects
};
