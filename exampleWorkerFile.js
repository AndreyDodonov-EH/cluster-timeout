process.on("message", function (reqMsg) {
  if (reqMsg === 1) {
    while (true);
  } else {
    const resMsg = {data: 'ok'};
    process.send(resMsg);
  }
}
