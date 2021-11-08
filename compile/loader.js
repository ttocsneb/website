const path = require('path');
const utils = require('./utils');

const data = path.resolve(__dirname, "../data");

/**
 * 
 * @param {{path: string, dest: string, updates: Array<object>}} settings 
 */
async function load_updates(settings) {
    settings.updates = [];
    let updates_exist = await utils.exists(path.resolve(settings.path, "updates"));
    if (!updates_exist) {
        return;
    }
    // let updates = await list_date_files(path.resolve(settings.path, "updates"));
    let updates = await utils.list_dir(path.resolve(settings.path, "updates"));

    for (let filename of updates.files) {
        let file = path.resolve(settings.path, 'updates', filename);
        let markdown = await utils.read_markdown(file);
        let update = {
            path: file,
            dest: null,
            date: null,
            content: markdown.content,
            metadata: markdown.metadata,
            name: /[^\.]+/.exec(filename)[0],
        };
        settings.updates.push(update);
    }
}

/**
 * Load the projects from disk
 * 
 * @returns {Promise<object>} projects
 */
async function load_projects() {
    let projects = [];
    let items = await utils.list_dir(data);
    for (let name of items.folders) {
        let folder = path.resolve(data, name);
        let project = {
            path: folder,
            dest: null,
            updates_dest: null,
            updates: [],
            name,
            project: await utils.read_markdown(path.resolve(folder, 'project.md')),
            summary: await utils.read_markdown(path.resolve(folder, 'summary.md')),
        };
        projects.push(project);
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
