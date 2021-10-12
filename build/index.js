const loader = require("./loader");
const preprocessor = require("./preprocessor");
const renderer = require('./renderer');

async function main() {
    try {
        let projects = await loader.load_projects();
        if (await preprocessor.preprocess(projects)) {
            console.log("Saving data");
            await loader.save_projects(projects);
        }

        console.log("Rendering projects");
        await renderer.renderProjects(projects);
    } catch (err) {
        console.error(err);
    }
}

main();
