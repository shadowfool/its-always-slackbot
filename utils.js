
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

module.exports = {
    transformStringToFit
}