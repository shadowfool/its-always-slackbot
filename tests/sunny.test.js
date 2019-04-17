const tinder = require('../imageProcessors/tinder');
const fs = require('fs');

function res (err, buffer) {
    if(err) return console.error('ERR', err);
    fs.writeFileSync('./img.png', buffer, 'base64' );
}
tinder( "TESTING", res)