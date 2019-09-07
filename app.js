const { InitWithWorkerFile, Exec } = require('./fileExecutor');

InitWithWorkerFile('./exampleWorkerFile.js');

runIt([1, 1, 0, 0, 1])
    .then(() => {
    })
    .catch(() => {
    })


async function runIt(msgs) {
  for (const reqMsg of msgs) {
    try {
      console.log(reqMsg);
      const res = await Exec(reqMsg);
      console.log(res.data);
    } catch (e) {
      console.log(e.error);
    }
  }
}

