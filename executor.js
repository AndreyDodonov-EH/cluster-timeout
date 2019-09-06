const cluster = require('cluster');

let worker;
let timer = {};

module.exports.Init = function Init() {
  cluster.setupMaster({
    exec: "./worker.js",
    silent: false
  });
}

module.exports.Exec = function Exec(msg) {
  return new Promise((resolve, reject) => {
    let nmbOfWorkers = Object.keys(cluster.workers).length;
    if (0 == nmbOfWorkers) {
      goOnline()
          .then(() => {
            timeout()
                .catch(() => {
                  reject('timeout');
                })
            worker.send(msg);
            calc()
                .then((data) => {
                  resolve(data);
                })
          })
          .catch(() => {
            reject('unknown')
          })
    } else {
      timeout()
          .catch(() => {
            reject('timeout');
          })
      worker.send(msg);
      calc()
          .then((data) => {
            resolve(data);
          })
    }
  });
}

function calc() {
  return new Promise((resolve) => {
    worker.on("message", function (msgFromWorker) {
      clearTimeout(timer);
      resolve(msgFromWorker);
    });
  });
}

function goOnline() {
  return new Promise((resolve) => {
    worker = cluster.fork();
    worker.on('online', () => {
      resolve();
    });
  });
}

function timeout() {
  return new Promise((resolve, reject) => {
    timer = setTimeout(() => {
      worker.process.kill();
      worker.on('exit', () => {
        reject('timeout');
      });
    }, 100);
  });
}
