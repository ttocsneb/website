const loader = require("./loader");

loader.load_sites((err, projects) => {
    if (err) {
        console.error(err);
        return;
    }
    console.info(JSON.stringify(projects, 0, 2));
});