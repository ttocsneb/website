const db = require('./db');
const passwords = require('./passwords');

let args = process.argv.slice(2);

/**
 * 
 * Parse some command line arguments
 * 
 * @param {Array<string>} args 
 * @returns {{options: Array<string>, keys: {[key: string]: string}, arguments: Array<string>}} the parsed arguments
 */
function parseArgs(args) {
    let options = [];
    let keys = {};
    let arguments = [];
    for (let i = 0; i < args.length; ++i) {
        if (args[i].startsWith('--')) {
            if (args.length == i + 1) {
                console.error("-- arguments must have a value attached to them");
                process.exit(1);
            }
            keys[args[i].substr(2)] = args[i + 1];
            ++i;
        } else if (args[i].startsWith('-')) {
            options.push(args[i].substr(1));
        } else {
            arguments.push(args[i]);
        }
    }
    return {
        options,
        keys,
        arguments,
    };
}

async function listUser(args) {
    let users = await db.User.find();
    for (let user of users) {
        console.log(`${user.name}: ${user.email} ${user.isAdmin ? '(admin)' : ''}`);
    }
    await db.disconnect();
}

async function createUser(args) {
    let parsed = parseArgs(args);

    if (parsed.options.includes('h')) {
        console.log(`
Usage: user create --name <name> --email <email> --password <password> [-admin]

    --name <name>           The name of the user
    --email <email>         The email of the user
    --password <password>   The password of the user

    -admin                  Include if the user should be an admin
`);
        process.exit(1);
    }

    if (parsed.keys.name == undefined
        || parsed.keys.email == undefined
        || parsed.keys.password == undefined) {
            console.error('The keys: --name, --email, --password are all required');
            process.exit(1);
    }

    if (await db.User.count({ name: parsed.keys.name }) > 0) {
        console.error('A user with that name already exists');
        process.exit(1);
    }
    if (await db.User.count({ email: parsed.keys.email }) > 0) {
        console.error('A user with that email already exists');
        process.exit(1);
    }

    let password = passwords.createPassword(parsed.keys.password);

    let user = new db.User({
        name: parsed.keys.name,
        email: parsed.keys.email,
        isAdmin: parsed.options.includes('admin'),
        password: password,
    });

    try {
        await user.save();
        console.log(user);
        await db.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(2);
    }
}

async function editUser(args) {
    let parsed = parseArgs(args);

    if (parsed.options.includes('h')) {
        console.info(`
Usage: user edit <id> [--name <name>] [--email <email>] [--password <password>] [-admin]

    id                      Name or email of the user you want to edit

    --name <name>           New name of the user
    --email <email>         New email of the user
    --password <password>   New password of the user

    -admin                  Make the user an admin
    -noadmin                Make the user not an admin
`);
        process.exit(1);
    }

    if (parsed.arguments.length == 0) {
        console.error("You must provide either the name or the email of the user you wish to delete");
        process.exit(1);
    }

    let user = await db.User.findOne({
        name: parsed.arguments[0]
    });
    if (user == null) {
        user = await db.User.findOne({
            email: parsed.arguments[0]
        });
    }

    if (user == null) {
        console.error("Could not find the user");
        process.exit(2);
    }

    let update = {};
    if (parsed.keys.name != undefined) {
        update.name = parsed.keys.name;
    }
    if (parsed.keys.email != undefined) {
        update.email = parsed.keys.email;
    }
    if (parsed.keys.password != undefined) {
        update.password = passwords.createPassword(parsed.keys.password);
    }
    if (parsed.options.includes('admin')) {
        update.isAdmin = true;
    }
    if (parsed.options.includes('noadmin')) {
        update.isAdmin = false;
    } 

    console.log(update);

    await db.User.findByIdAndUpdate(user._id, update);

    await db.disconnect();
}

async function deleteUser(args) {
    let parsed = parseArgs(args);

    if (parsed.options.includes('h')) {
        console.info(`
Usage: user delete <id>

    <id>    User name or email to delete
`);
        process.exit(1);
    }

    if (parsed.arguments.length == 0) {
        console.error("You must provide either the name or the email of the user you wish to delete");
        process.exit(1);
    }

    let result = await db.User.deleteMany({
        name: parsed.arguments[0]
    });
    if (result.deletedCount == 0) {
        result = await db.User.deleteMany({
            email: parsed.arguments[0]
        });
    }
    console.log(`Removed ${result.deletedCount} user${result.deletedCount != 1 ? 's' : ''}`);
    db.disconnect();
}

function userCommands(args) {
    switch (args[0]) {
        case 'create': createUser(args.slice(1));
            break;
        case 'edit': editUser(args.slice(1));
            break;
        case 'delete': deleteUser(args.slice(1));
            break;
        case 'list': listUser(args.slice(1));
            break;
        default:
            console.log("Options are: list, create, edit, delete");
            process.exit(1);
    }
}

switch (args[0]) {
    case 'user': userCommands(args.slice(1));
        break;
    default:
        console.log("Options are: user");
        process.exit(1);
}
