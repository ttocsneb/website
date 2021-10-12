const path = require('path');
const nunjucks = require('nunjucks');

const utils = require('./utils');

const render_dir = path.resolve(__dirname, '../');

const env = nunjucks.configure(path.resolve(__dirname, '../templates'), {
    throwOnUndefined: true,
    trimBlocks: true,
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
    await render('projects/project.html', path.resolve(project.dest, 'index.html'), {
        project,
        metadata: project.project.metadata,
        content: project.project.project,
    });

    for (let update of project.updates) {
        await render('projects/update.html', path.resolve(update.dest, 'index.html'), {
            project,
            update,
            metadata: update.metadata,
            content: update.content
        });
    }

    await render('projects/updates.html', path.resolve(project.updates_dest, 'index.html'), {
        project
    });
    await render('projects/feed.xml', path.resolve(project.updates_dest, 'feed.xml'), {
        project
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