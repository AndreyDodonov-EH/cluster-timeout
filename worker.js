process.on("message", function(msg) {
  // console.log('IN WORKER ' + msg);
  if (msg === 1) {
    while (true) {};
    console.log('IMPOSSIBLE');
  } else {
      process.send('ok');
    }
});
