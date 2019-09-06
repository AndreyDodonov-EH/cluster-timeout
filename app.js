const cluster = require('cluster');

cluster.setupMaster({
  exec: "./worker.js",
  silent: false
});

let worker;
let timer = {};

runIt([1, 1, 0, 0, 1])
    .then(() => {
    })
    .catch(() => {
    })


async function runIt(msgs) {
  for (const msg of msgs) {
    try {
      console.log(msg);
      const res = await exec(msg);
      console.log('SUCCESS ' + res);
    } catch (e) {
      console.log('ERROR ' + e);
    }
  }
}

function exec(msg) {
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
    }
    else {
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
