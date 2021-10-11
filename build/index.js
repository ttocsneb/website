const loader = require("./loader");
const preprocessor = require("./preprocessor");

async function main() {
    try {
        let projects = await loader.load_projects();
        if (preprocessor.preprocess(projects)) {
            console.log("Saving data");
            await loader.save_projects(projects);
        }
        console.log(JSON.stringify(projects, undefined, 2));
    } catch (err) {
        console.error(err);
    }
}

main();
