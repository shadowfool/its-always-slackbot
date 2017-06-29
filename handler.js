'use strict';

const request = require('request'),
      gm = require('gm').subClass({ imageMagick: true }),
      AWS = require('aws-sdk'),
      db = new AWS.DynamoDB.DocumentClient();

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

module.exports.generateTitleCard = (event, context, cb) => {
  let body = parseQuery(event.body),
  text = _transformStringToFit(body.text.replace(/\+/g, " ")),
  responseUrl = body.response_url,      
  postToSlack = (linkToImage) => {
        let options = {
          url: responseUrl,
          method: 'POST',
          json: true,
          body: {
            "text": "",
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

module.exports.generateAdultSwimCard = (event, context, cb) => {
  let body = parseQuery(event.body),
  text = _transformStringToFit(body.text.replace(/\+/g, " ")),
  responseUrl = body.response_url,      
  postToSlack = (linkToImage) => {
        let options = {
          url: responseUrl,
          method: 'POST',
          json: true,
          body: {
            "text": "",
            "response_type": "in_channel",
            "attachments": [
              {
                "title": "Adult Swim",
                "image_url": `${linkToImage}`
              }
            ]
          }
        };
        request(options, (e,d) => cb(null))
  },
  uploadImageToImgur = (str = 'fooo bar', callback = null) => {
    gm( 750, 500, '#000' )
      .fill('#fff')
      .font('./hncb.ttf')
      .fontSize(26)
      .drawText(0, 0, text,'Center')
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



module.exports.authorize = (event, context, cb) => {
  console.log(process.env.SLACK_CLIENT_ID, process.env.SLACK_CLIENT_SECRET)
    const code = event.queryStringParameters.code,
          slackParams = {
            url: `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}`,
            method: 'GET'
          };

        request(slackParams, (e, d, b) => {

           const body = JSON.parse(d.body),
                 dbParams = {
                    TableName: 'sunnySlackbotTokenTable',
                    team_id: body.team_id,
                    access_token: body.access_token
                };

            db.put(dbParams).promise()
            .catch(e => console.log(e));

            cb(null, {
              statusCode: 200,
              headers: {
                'Content-Type': 'text/html'
              },
              body: `
                  <!DOCTYPE html>
                  <html>
                    <head><title>It's Always Sunny In Slack</title></head>
                    <body>
                      <div>Sucessfuly Installed It's Always Sunny In Slack to ${ body.team_name }</div>
                    </body>
                  </html>
                  `
          })
        })
}

module.exports.ping = (event, context, cb) => {
  console.log("pong")
}