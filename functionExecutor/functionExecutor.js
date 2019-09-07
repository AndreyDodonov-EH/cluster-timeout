const cluster = require('cluster');

// const { SetFunc } = require('./worker');
let _func;

if (cluster.isMaster) {

  let _worker;
  let _timer = {};
  let _defaultTimeout = 100;

  module.exports.InitWithWorkerFunction = function Init(workerFunction, defaultTimeout = undefined) {
    if (defaultTimeout) {
      _defaultTimeout = defaultTimeout;
    }
    cluster.setupMaster({
      exec: './functionExecutor.js', // ToDo consider to make path relative to a caller, if it is possible
      silent: false
    });
    _func = workerFunction;
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

} else {
  process.on("message", (reqMsg) => {
    console.log('IN WORKER');
    console.log(typeof _func);
    console.log(_func);
    const resMsg = _func(reqMsg);
    process.send(resMsg);
  });
}
