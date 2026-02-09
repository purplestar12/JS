const fs = require("fs");
const crypto = require("crypto");

process.env.UV_THREADPOOL_SIZE = 4; //default is 4 only
start = Date.now();
setTimeout(() => console.log("Set Timeout 1"), 0);

setImmediate(() => console.log("Set Immediate 1"));

fs.readFile("test.txt", () => {
  console.log("I/O finished");
  console.log("----------------------------");

  setTimeout(() => console.log("Set Timeout 2"), 0);
  setTimeout(() => console.log("Set Timeout 3"), 3000);

  setImmediate(() => console.log("Set Immediate 2"));

  process.nextTick(() => console.log("Next Tick"));

  crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
  crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", () => {
    console.log(Date.now() - start, "password encrypted");
  });
});

console.log("This is Top level code");
