const nunjucks = require('nunjucks');

nunjucks.configure({
    autoescape: true
});

console.log(nunjucks.renderString("hello {{ username }}", {
    username: 'James'
}));