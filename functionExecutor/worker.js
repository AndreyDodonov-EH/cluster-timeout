const cluster = require('cluster');

let _func;

if (cluster.isMaster) {
  module.exports.SetFunc = function SetFunc(func) {
    _func = func;
  }
} else {
  process.on("message", (reqMsg) => {
    const resMsg = _func(reqMsg);
    process.send(resMsg);
  });
}
