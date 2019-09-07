const cluster = require('cluster');

const fs = require("fs");

let _worker;
let _timer = {};
let _defaultTimeout = 100;

/**
 *
 * @param {string} pathToWorkerFile Path (RELATIVE TO EXECUTOR MODULE!) to the file containing worker code to be executed with timeout.
 * @param defaultTimeout Default timeout after which the worker will be killed, if it does not send any message before that.
 * @constructor
 */
module.exports.InitWithWorkerFile = function Init(pathToWorkerFile, defaultTimeout = undefined) {
  if (defaultTimeout) {
    _defaultTimeout = defaultTimeout;
  }
  if (!fs.existsSync(pathToWorkerFile)) {
    throw new Error('Worker file not found at ' + pathToWorkerFile);
  }

  cluster.setupMaster({
    exec: pathToWorkerFile, // ToDo consider to make path relative to a caller, if it is possible
    silent: false
  });
}

module.exports.Exec = function Exec(reqMsg, timeout = undefined) {
  return new Promise((resolve, reject) => {
    let nmbOfWorkers = Object.keys(cluster.workers).length;
    if (0 == nmbOfWorkers) {
      goOnline()
          .then(() => {
            execWithTimeout(reqMsg, resolve, reject, timeout);
          })
          .catch(() => {
            const resMsg = {error: 'worker failed to go online' };
            reject(resMsg);
          })
    } else {
      execWithTimeout(reqMsg, resolve, reject, timeout);
    }
  });
}

function goOnline() {
  return new Promise((resolve) => {
    _worker = cluster.fork();
    _worker.on('online', () => {
      resolve();
    });
  });
}

function execWithTimeout(reqMsg, resolve, reject, timeout) {
    const timeoutToUse = timeout ? timeout : _defaultTimeout;
    _worker.on("message", (resMsg) => {
      clearTimeout(_timer);
      resolve(resMsg);
    });
    _worker.send(reqMsg);
    // kill in case of timeout
    _timer = setTimeout(() => {
      _worker.process.kill();
      _worker.on('exit', () => {
        reject({error: 'timeout'});
      });
    }, timeoutToUse);
}
