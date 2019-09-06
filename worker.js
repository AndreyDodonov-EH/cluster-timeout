const x = 0; // DUMMY CODE IS NECESSARY FOR WORKER TO BE SEEN ONLINE

process.on("message", function(msg) {
  // console.log('IN WORKER ' + msg);
  if (msg === 1) {
    while (true) {};
    console.log('IMPOSSIBLE');
  } else {
      process.send('ok');
    }
});
