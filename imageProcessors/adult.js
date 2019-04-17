const gm = require('gm').subClass({ imageMagick: true });
const transformStringToFit = require('../utils').transformStringToFit;

const adult = ( text, cb ) => {
    const fontSize = 26,
    fontPath = "../fonts/hncb.ttf";

    gm( 750, 500, '#000' )
    .fill('#fff')
    .font(fontPath)
    .fontSize(fontSize)
    .drawText(0, 0, text,'Center')
    .toBuffer('png', cb )
}


module.exports = adult;


