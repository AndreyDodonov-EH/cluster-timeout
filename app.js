const {Init, Exec} = require('./executor');

Init();

runIt([1, 1, 0, 0, 1])
    .then(() => {
    })
    .catch(() => {
    })


async function runIt(msgs) {
  for (const msg of msgs) {
    try {
      console.log(msg);
      const res = await Exec(msg);
      console.log('SUCCESS ' + res);
    } catch (e) {
      console.log('ERROR ' + e);
    }
  }
}

