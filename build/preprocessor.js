const uuid = require('uuid');
const crypto = require('crypto');

const utils = require('./utils');
const dateFormat = require('./dateFormat').dateFormat;

var clockseq = crypto.randomInt(0, 0x3FFF);

/**
 * The clock sequence is used to make sure that there is no way that a large
 * number of uuids created at the same time with the same timestamp will have
 * the same uuid
 * 
 * @returns the next clock sequence
 */
function nextClockSeq() {
    clockseq = (clockseq + 1) % 0x3FFF;
    return clockseq;
}

/**
 * Pre-process the loaded projects
 * 
 * @param {object} projects 
 * @returns {boolean} whether the projects need to be saved
 */
async function preprocess(projects) {
    let updated = false;
    for (let project of Object.values(projects)) {
        for (let update of project.updates) {
            if (!update.metadata.date) {
                let stats = await utils.stat(update.path);
                let date = stats.mtime;
                update.metadata.date = dateFormat(date, "ddd, dd mmm yyyy HH:MM:ss o");
                updated = true;
            }
            if (!update.metadata.uuid) {
                // Generate the uuid from the date of the update with some added randomness
                update.metadata.uuid = uuid.v1({
                    msecs: new Date(update.metadata.date).getTime(),
                    clockseq: nextClockSeq(),
                    nsecs: crypto.randomInt(0, 1000)
                });

                updated = true;
            }

        }
    }
    return updated;
}

module.exports = {
    preprocess
};
