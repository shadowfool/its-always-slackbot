'use strict';

const request = require('request'),
      gm = require('gm').subClass({ imageMagick: true }),
      AWS = require('aws-sdk'),
      db = new AWS.DynamoDB;
/**
Function to parse out query string parameters into object key pairs. 
**/
function parseQuery(qstr = '') {
    let query = {},
    a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
    for (var i = 0; i < a.length; i++) {
        let b = a[i].split('=');
        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
    }
    return query;
};
/**
Transforms a string into chunks seperated by a new line character restricted either 26 chars
or by the maxLength agrument provided
**/
function transformStringToFit(str = '', maxLength = 26) {
    let dividedString = str.split(' '),
     lines = [""],
     currentLine = 0;

    dividedString.forEach( (word) => {
      if (lines[currentLine].length + word.length <= maxLength) {
          lines[currentLine] = lines[currentLine] + " " + word;
      } else {
          currentLine = currentLine + 1;
          lines[currentLine] = word;
      }
    });

    return lines.join('\n');
};

function savePostToDB(link, text, type)
{
  let dbParams = {
    Item: {
      "link": {
        S: link
      }, 
      "text": {
        S: text
      },
      "type": {
        S: type
      },
      "date": {
        S: new Date().toString()
      }
    }, 
    TableName: "sunnyPosts"
  };
  db.putItem(dbParams, (e,d) => console.log(e,d))
}

/**
Function to both create an image with specificed parameters provided as arguemnts
and upload said image to imgur. 
returns nothing. However, it will call the link to the imgur image as the arguemnt
to the provided callback function.
**/
function uploadImageToImgur (str = 'fooo bar', callback = () => {}, type = 'sunny') {
    let fontSize = 30,
        fontPath = "./Textile.ttf";
    if(type === 'adult'){
      fontSize = 26
      fontPath = "./hncb.ttf"
    }

    gm( 750, 500, '#000' )
      .fill('#fff')
      .font(fontPath)
      .fontSize(fontSize)
      .drawText(0, 0, str,'Center')
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

/**
AWS Lambda Function to create an It's Always Sunny In Philidelphia style title card
with provided text.
**/ 
module.exports.generateTitleCard = (event, context, cb) => {
  let body = parseQuery(event.body),
  text = transformStringToFit(body.text.replace(/\+/g, " ")),
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
        savePostToDB(linkToImage, text, 'sunny');
        request(options);
  };
  text = text.substr(1);
  uploadImageToImgur("\"".concat(text.concat("\"")), postToSlack, 'sunny');
  cb(null, {statusCode: 200});
};

/**
AWS Lambda Function to create an Adult Swim style title card
with provided text.
**/ 
module.exports.generateAdultSwimCard = (event, context, cb) => {
  let body = parseQuery(event.body),
  text = transformStringToFit(body.text.replace(/\+/g, " ")),
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
        savePostToDB(linkToImage, text, 'adult');
        request(options)
  };
  uploadImageToImgur(text, postToSlack, 'adult')
  cb(null, {statusCode: 200})
};


/**
Authorizes Slack Teams to use the application with the click of 'Add to Slack' button.
This is nessecary for distributed applications.
Will save teamId and access_token generated at call time to a Dynamo DB instance as defined 
in serverless.yml.
Returns a html template that indicates a sucessful instalation.
**/
module.exports.authorize = (event, context, cb) => {
    const code = event.queryStringParameters.code,
          slackParams = {
            url: `https://slack.com/api/oauth.access?client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&code=${code}`,
            method: 'GET'
          }

        request(slackParams, (e, d, b) => {

          const body = JSON.parse(d.body),
                dbParams = {
                  Item: {
                    "team_id": {
                      S: body.team_id
                    }, 
                    "access_token": {
                      S: body.access_token
                    }
                  }, 
                  TableName: "sunnySlackbotTokenTable"
                };

            db.putItem(dbParams, (e,d) => console.log(e,d))

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


module.exports.addLink = (event, context, cb) => {
  
}

module.exports.ping = (event, context, cb) => {
  console.log("pong")
}