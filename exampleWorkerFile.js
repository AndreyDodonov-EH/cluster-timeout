process.on("message", (reqMsg) => {
  const resMsg = dangerousFunction(reqMsg);
  process.send(resMsg);
});

function dangerousFunction(reqMsg) {
  if (reqMsg === 1) {
    while (true);
  } else {
    return  {data: 'ok'};
  }
}
