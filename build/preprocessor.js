const uuid = require('uuid');

/**
 * Pre-process the loaded projects
 * 
 * @param {object} projects 
 * @returns {boolean} whether the projects need to be saved
 */
function preprocess(projects) {
    let updated = false;
    for (let project of Object.values(projects)) {
        for (let update of project.updates) {
            if (!update.metadata.uuid) {
                update.metadata.uuid = uuid.v4();
                updated = true;
            }
        }
    }
    return updated;
}

module.exports = {
    preprocess
};
