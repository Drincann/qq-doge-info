
function read() {
  try {
    return JSON.parse(require('fs').readFileSync(__dirname + '/db.json'));
  } catch (error) {
    console.log(error);
  }
}

function save(json) {
  if (typeof json == 'string') {
    require('fs').writeFileSync(__dirname + '/db.json', json);
  } else {
    require('fs').writeFileSync(__dirname + '/db.json', JSON.stringify(json));
  }
}

module.exports = {
  read, save
}