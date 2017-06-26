'use strict';

const request = require('request'),
      gm = require('gm').subClass({ imageMagick: true });

function parseQuery(qstr) {
    var query = {};
    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
        var b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
}

function _transformStringToFit(str) {
    let dividedString = str.split(' '),
     lines = [""],
     currentLine = 0;

    dividedString.forEach( (word) => {
        if (lines[currentLine].length + word.length <= 26) {
        lines[currentLine] = lines[currentLine] + " " + word;
    } else {
        currentLine = currentLine + 1;
        lines[currentLine] = word;
    }
    });

    return lines.join('\n');
}

module.exports.sunny = (event, context, cb) => {
  let body = parseQuery(event.body),
  text = _transformStringToFit(body.text.replace(/\+/g, " ")),
  responseUrl = body.response_url,      
  postToSlack = (linkToImage) => {
        let options = {
          url: responseUrl,
          method: 'POST',
          json: true,
          body: {
            "text": "New Shitpost Alert!",
            "response_type": "in_channel",
            "attachments": [
              {
                "title": "It's Always Sunny In Slack",
                "image_url": `${linkToImage}`
              }
            ]
          }
        };
        request(options, (e,d) => cb(null))
  },
  uploadImageToImgur = (str = 'fooo bar', callback = null) => {
    gm( 500, 500, '#000' )
      .fill('#fff')
      .font('./Textile.ttf')
      .fontSize(30)
      .drawText(0, 0, text,'Center')
      .border(2, 2).borderColor('#ff0000')
      .toBuffer('png', (err, buffer) =>  {
          let base64Encode = buffer.toString('base64'),
          options = {
           url: 'https://api.imgur.com/3/image',
           method: 'POST',
           headers: {
              'User-Agent': 'request',
              'authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
           },
          json: true,
          body: {
            type: 'base64',
            image: base64Encode
          }
        }
        request(options, (e, d) => {
           callback(d.body.data.link)
        })
      });
  }
  uploadImageToImgur(text, postToSlack)
};