const { InitWithWorkerFunction, Exec } = require('./functionExecutor');

function exampleFunction(reqMsg) {
  if (reqMsg === 1) {
    while (true);
  } else {
    const resMsg = {data: 'ok'};
    return resMsg;
  }
}

InitWithWorkerFunction(exampleFunction);

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

