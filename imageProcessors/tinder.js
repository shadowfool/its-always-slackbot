const gm = require('gm').subClass({ imageMagick: true });
const transformStringToFit = require('../utils').transformStringToFit;


function tinder (text, cb ){
    const fontSize = 30,
    fontPath = "../fonts/Textile.ttf";

    const transformedText = transformStringToFit( text, 24)

    gm( 750, 500, '#000' )
    .resize(100, 100)
    .fill('#fff')
    .font(fontPath)
    .fontSize(fontSize)
    .drawText(0, 0, transformedText,'Center')
    .toBuffer('png', cb )
}

module.exports = tinder;