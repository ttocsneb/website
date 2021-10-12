const path = require('path');
const utils = require('./utils');

const data = path.resolve(__dirname, "../data");


/**
 * 
 * @param {string} folder 
 * @returns {Promise<{[key: string]: Array<string>}>} object of files in a date tree file structure
 */
async function list_date_files(folder) {
    let result = {};
    let years = await utils.list_dir(folder);
    for (let year of years.folders) {
        let months = await utils.list_dir(path.resolve(folder, year));
        for (let month of months.folders) {
            let days = await utils.list_dir(path.resolve(folder, year, month));
            for (let day of days.folders) {
                let files = await utils.list_dir(path.resolve(folder, year, month, day));
                let date = `${year}/${month}/${day}`;
                result[date] = files.files;
            }
        }
    }
    return result;
}

/**
 * 
 * @param {{path: string, dest: string, updates: Array<object>}} settings 
 */
async function load_updates(settings) {
    let updates_exist = await utils.exists(path.resolve(settings.path, "updates"));
    if (!updates_exist) {
        return;
    }
    let updates = await list_date_files(path.resolve(settings.path, "updates"));
    settings.updates = [];
    for (let [date, files] of Object.entries(updates)) {
        for (let file of files) {
            let update = {
                dest: path.resolve(settings.dest, 'updates', date, file.replace(/\..*/, '')),
                date,
                path: path.resolve(settings.path, 'updates', date, file),
                content: null,
                metadata: null
            };
            settings.updates.push(update);

            let markdown = await utils.read_markdown(update.path);
            update.metadata = markdown.metadata;
            update.content = markdown.content;
        }
    }
}

/**
 * Load the projects from disk
 * 
 * @returns {Promise<object>} projects
 */
async function load_projects() {
    let projects = {};
    let items = await utils.list_dir(data);
    for (let name of items.folders) {
        let folder = path.resolve(data, name);
        projects[name] = {
            path: folder,
            dest: `/projects/${name}/`,
            updates_dest: `/projects/${name}/updates/`,
            updates: [],
            name
        };
        let project = projects[name];
        project.project = await utils.read_markdown(path.resolve(folder, 'project.md'));
        project.summary = await utils.read_markdown(path.resolve(folder, 'summary.md'));
        await load_updates(project);
    }
    return projects;
}

/**
 * Save the projects
 * 
 * @param {object} projects 
 */
async function save_projects(projects) {
    for (let project of Object.values(projects)) {
        await utils.write_markdown(path.resolve(project.path, 'project.md'), project.project.content, project.project.metadata);
        await utils.write_markdown(path.resolve(project.path, 'summary.md'), project.summary.content, project.summary.metadata);
        if (!project.updates) {
            return;
        }
        for (let update of project.updates) {
            await utils.write_markdown(update.path, update.content, update.metadata);
        }
    }
}

module.exports = {
    load_projects,
    save_projects
};
