const gm = require('gm').subClass({ imageMagick: true });
const transformStringToFit = require('../utils').transformStringToFit;

const sunny = ( text, cb ) => {
    const fontSize = 30,
    fontPath = "../fonts/Textile.ttf";

    gm( 750, 500, '#000' )
    .fill('#fff')
    .font(fontPath)
    .fontSize(fontSize)
    .drawText(0, 0, text,'Center')
    .toBuffer('png', cb )
}



module.exports = sunny;