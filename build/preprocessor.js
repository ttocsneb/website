const uuid = require('uuid');
const crypto = require('crypto');

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
function preprocess(projects) {
    let updated = false;
    for (let project of Object.values(projects)) {
        for (let update of project.updates) {
            if (!update.metadata.uuid) {
                // Generate the uuid from the date of the update with some added randomness
                let result = /(\d+)\/(\d+)\/(\d+)/.exec(update.date);
                let date = new Date();
                date.setFullYear(result[1], result[2], result[3]);

                update.metadata.uuid = uuid.v1({
                    msecs: date.getTime(),
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
