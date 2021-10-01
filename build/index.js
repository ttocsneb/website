const loader = require("./loader");
const preprocessor = require("./preprocessor");

loader.load_projects((err, projects) => {
    if (err) {
        console.error(err);
        return;
    }
    if (preprocessor.preprocess(projects)) {
        loader.save_projects(projects, (err) => {
            if (err) {
                console.error(err);
                return;
            }
        });
    }
    console.info(JSON.stringify(projects, 0, 2));
});