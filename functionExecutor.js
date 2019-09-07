const cluster = require('cluster');

const fs = require("fs");
const { SetFunc } = require('./worker');

let _worker;
let _timer = {};
let _defaultTimeout = 100;

module.exports.InitWithFunction = function Init(workerFunction, defaultTimeout = undefined) {
  if (_defaultTimeout) {
    _defaultTimeout = defaultTimeout;
  }

  SetFunc(workerFunction);

  cluster.setupMaster({
    exec: './worker.js',
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
