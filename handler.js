'use strict';

const request = require('request'),
      svg2png = require('svg2png'),
      fs = require('fs');

module.exports.sunny = (event, context) => {
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // };
  let text = '',
      callback = () => {
        //TODO send a response to slack
      }

  function uploadImageToImgur(str = '1', callback)
  {
    let textSplit = str.match(/.{1,10}/g),
    textMap = textSplit.map((text, index) => `<text font-size="35" font-family="Courier" x="200" y="${ 200 + (index * 50) }" fill="white" > ${ text } </text>`).join(''),
    svgTemplate = `
    <svg width="500" height="500">
      <rect width="500" height="500" fill="black" />
      ${ textMap }
    </svg>
    `
      svg2png(new Buffer( svgTemplate ))
     .then( buffer => buffer.toString('base64') )
     .then((base64Image) => {
        let options = {
           url: 'https://api.imgur.com/3/image',
           method: 'POST',
           headers: {
              'User-Agent': 'request',
              'authorization': `Client-ID ${ process.env.IMGUR_CLIENT_ID }`,
           },
           json: true,
           body: {
            type: 'base64',
            image: base64Image
          }
        }
        request(options, (e, d) => console.log(d.body.data.link) )
    })
    .catch( e => console.log( e ))
  }
  uploadImageToImgur(text, callback)
};


