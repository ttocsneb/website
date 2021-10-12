const path = require('path');
const nunjucks = require('nunjucks');
const marked = require('marked');

const utils = require('./utils');
const dateFormat = require('./dateFormat').dateFormat;

const render_dir = path.resolve(__dirname, '../');
const domain = 'http://benjaminja.info';

const now = new Date();

const env = nunjucks.configure(path.resolve(__dirname, '../templates'), {
    throwOnUndefined: true,
    // trimBlocks: true
});

env.addFilter('date', (date, fmt) => {
    if (!fmt) {
        fmt = "ddd, dd mmm yyyy HH:MM:ss o";
    }
    if (typeof(date) === 'string') {
        date = new Date(date);
    }
    return dateFormat(date, fmt);
});
env.addFilter('markdown', (content) => {
    if (content) {
        return marked(content);
    }
});

/**
 * Render a template
 * 
 * @param {string} name 
 * @param {object} context 
 * @returns {Promise<string>} rendered string
 */
function render_template(name, context) {
    return new Promise((resolve, reject) => {
        env.render(name, context, (err, res) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

/**
 * Render a template
 * 
 * @param {string} name name of the template
 * @param {string} output name of the output file
 * @param {object} context context to render the template with
 * @returns {Promise<void>}
 */
async function render(name, output, context) {
    console.log(`rendering '${output}'`);
    let content = await render_template(name, context);
    if (output[0] == '/') {
        output = output.substr(1);
    }
    if (!await utils.exists(path.resolve(render_dir, output, '..'))) {
        await utils.mkdir(path.resolve(render_dir, output, '..'));
    }
    await utils.write_file(path.resolve(render_dir, output), content);
}

/**
 * Render a project to disk
 * 
 * @param {object} project 
 */
async function renderProject(project) {
    let latest_update = null;
    // Find the latest update
    if (project.updates.length > 0) {
        let max_date = new Date(project.updates[0].metadata.date);
        latest_update = project.updates[0];
        for (let update of project.updates) {
            let d = new Date(update.metadata.date);
            if (max_date < d) {
                max_date = d;
                latest_update = update;
            }
        }
    }

    await render('projects/project.html', path.resolve(project.dest, 'index.html'), {
        project,
        latest_update,
        metadata: project.project.metadata,
        content: project.project.content,
        now,
        domain,
    });

    for (let update of project.updates) {
        await render('projects/update.html', path.resolve(update.dest, 'index.html'), {
            project,
            latest_update,
            update,
            metadata: update.metadata,
            content: update.content,
            now,
            domain,
        });
    }

    await render('projects/updates.html', path.resolve(project.updates_dest, 'index.html'), {
        project,
        latest_update,
        now,
        domain,
    });

    await render('projects/feed.xml', path.resolve(project.updates_dest, 'feed.xml'), {
        project,
        latest_update,
        now,
        domain,
    });
}

/**
 * Render all projects to disk
 * 
 * @param {object} projects 
 */
async function renderProjects(projects) {
    for (let project of Object.values(projects)) {
        await renderProject(project);
    }
}

module.exports = {
    renderProjects,
};