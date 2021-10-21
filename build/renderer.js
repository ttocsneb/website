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

const months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
};

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
async function renderProject(project, projects) {
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
        title: project.project.metadata.name,
        path: project.dest,
        projects,
        project,
        latest_update,
        metadata: project.project.metadata,
        content: project.project.content,
        now,
        domain,
    });

    for (let update of project.updates) {
        await render('projects/update.html', path.resolve(update.dest, 'index.html'), {
            title: `${project.project.metadata.name} - ${update.metadata.title}`,
            path: update.dest,
            projects,
            project,
            latest_update,
            update,
            metadata: update.metadata,
            content: update.content,
            now,
            domain,
        });
    }

    let years = {};

    // Organize the updates into time groups
    for (let update of project.updates) {
        let date = /(\d+)\/(\d+)\/(\d+)/.exec(update.date);
        if (years[date[1]] == undefined) {
            years[date[1]] = {};
        }
        let month = months[date[2]];
        if (years[date[1]][month] == undefined) {
            years[date[1]][month] = [];
        }
        years[date[1]][month].push(update);
    }

    await render('projects/updates.html', path.resolve(project.updates_dest, 'index.html'), {
        title: `${project.project.metadata.name} - updates`,
        dest: project.updates_dest,
        projects,
        project,
        latest_update,
        now,
        domain,
        years,
    });


    await render('projects/feed.xml', path.resolve(project.updates_dest, 'feed.xml'), {
        projects,
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
        await renderProject(project, projects);
    }
    await render('projects/projects.html', 'index.html', {
        title: 'Projects',
        path: '/',
        projects,
    });
}

module.exports = {
    renderProjects,
};