var Promise = require('bluebird');
var dir = require('node-dir');
var path = require('path');


function getFilesFromDisk(subdir) {
  return new Promise(function(resolve, reject) {

    var filesOnDisk = [];

    // Only iterate through supported .js and .html files in dir
    dir.readFiles(subdir, { match: /.js$|.gs$|.html$/ },
      // Invoke this callback on each file
      function(err, content, filename, next) {
        if (err) return reject(err);

        // Parse file's absolute path and add its content to result object
        file = path.parse(filename);
        file.content = content;

        filesOnDisk.push(file);

        // Continue to next file
        next();
      },
      // finished callback. Write updated manifest back to file
      function(err) {
        if (err) return reject(err);
        resolve(filesOnDisk);
      });
  })
  .error(function() {
    // swallow ENOENT
    return [];
  });
}

function updateFileSource(existingFile, newFile) {
  existingFile.source = newFile.content;
}

function hasFileOnDisk(filesOnDisk, file) {
  for (var i = 0; i < filesOnDisk.length; i++) {
    var sameName = file.name === filesOnDisk[i].name;
    var sameType = file.type === getFileType(filesOnDisk[i]);
    if (sameName && sameType) return true;
  }
  return false;
}

function getFileType(file) {
  if (file.ext === '.js') return 'server_js';
  if (file.ext === '.gs') return 'server_js';
  if (file.ext === '.html') return 'html';
  throw new Error('Unsupported file type found. Google Apps Script only allows .js and .html');
}

function swapGStoJS(filename) {
  if (filename.indexOf('.gs') === filename.length - 3) {
    return filename.substr(0, filename.lastIndexOf('.gs')) + '.js';
  }

  return filename;
}


module.exports.getFilesFromDisk = getFilesFromDisk;
module.exports.updateFileSource = updateFileSource;
module.exports.hasFileOnDisk = hasFileOnDisk;
module.exports.getFileType = getFileType;
module.exports.swapGStoJS = swapGStoJS;
