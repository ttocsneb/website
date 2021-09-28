const fs = require('fs');
const path = require('path');
const parseMD = require('parse-md').default;
const marked = require('marked');

const data = path.resolve(__dirname, "../data");


/**
 * 
 * @param {string} dir 
 * @param {(items: {files: Array<string>, folders: Array<string>}) => void} callback 
 */
function list_dir(dir, callback) {
    let items = {
        folders: [],
        files: []
    };
    let depth = 0;
    function enter() {
        depth += 1;
    }
    function exit() {
        depth -= 1;
        if (depth == 0) {
            callback(items);
        }
    }

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error(err.message);
            return;
        }

        for (let file of files) {
            enter();
            fs.stat(path.resolve(dir, file), (err, stats) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
                
                if (stats.isDirectory()) {
                    items.folders.push(file);
                } else if (stats.isFile()) {
                    items.files.push(file);
                }
                exit();
            });
        }
    });
}

/**
 * 
 * @param {string} file 
 * @param {(metadata: object, content: string) => void} callback 
 */
function read_markdown(file, callback, baseUrl) {
    fs.readFile(file, (err, data) => {
        if (err) {
            console.error(err.message);
            return;
        }
        let markdown = parseMD(data.toString());
        marked.parse(markdown.content, {
            baseUrl,
            gfm: true
        }, (err, result) => {
            if (err) {
                console.error(err.message);
                return;
            }
            callback(markdown.metadata, result);
        });
    });
}

function list_date_files(folder, callback) {
    let data = {};

    let depth = 0;
    function start() {
        depth += 1;
    }
    function end() {
        depth -= 1;
        if (depth == 0) {
            callback(data);
        }
    }

    start();
    list_dir(folder, (years) => {
        for (let year of years.folders) {
            start();
            list_dir(path.resolve(folder, year), (months) => {
                for (let month of months.folders) {
                    start();
                    list_dir(path.resolve(folder, year, month), (days) => {
                        for (let day of days.folders) {
                            start();
                            list_dir(path.resolve(folder, year, month, day), (files) => {
                                let date = `${year}/${month}/${day}`;
                                data[date] = files.files;
                                end();
                            });
                        }
                        end();
                    });
                }
                end();
            });
        }
        end();
    });
}

function load_updates(folder, callback) {
    list_date_files(path.resolve(folder, 'updates'), (files) => {
        console.log(files);
    });
}


function load_sites(callback) {
    let projects = {};
    let procs = 0;

    function start() {
        procs += 1;
    }
    function complete() {
        procs -= 1;
        if (procs == 0) {
            callback(projects);
        }
    }

    list_dir(data, (items) => {
        for (let name of items.folders) {
            let folder = path.resolve(data, name);
            projects[name] = {
                dest: `/projects/${name}/`
            };

            start();
            read_markdown(path.resolve(folder, "project.md"), (metadata, content) => {
                for ([k, v] of Object.entries(metadata)) {
                    projects[name][k] = v;
                }
                projects[name].project = content;
                complete();
            }, projects[name].dest);
            start();
            read_markdown(path.resolve(folder, "summary.md"), (metadata, content) => {
                projects[name].summary = content;
                complete();
            }, '/');
            fs.access(path.resolve(folder, "updates"), (err) => {
                if (err) {
                    return;
                }
                load_updates(folder);
            })
        }
    });
}

load_sites((projects) => {
    console.log(projects);
});