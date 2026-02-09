const fs = require("fs");
const server = require("http").createServer();

//Read File
//Solution 1
// server.on("request", (req, res) => {
//   fs.readFile("test.txt", (err, data) => {
//     console.log("File read successfully");
//     if (err) {
//       console.log(err);
//     }
//     res.end(data);
//   });
// });

//Solution 2
// server.on("request", (req, res) => {
//   const readable = fs.createReadStream("test.txt");
//   readable.on("data", (chunk) => {
//     res.write(chunk);
//   });
//   readable.on("end", () => {
//     console.log("ENDING !!!");
//     res.end();
//   });
//   readable.on("error", (err) => {
//     console.log(err);
//     res.end();
//   });
// });

// Solution 3
server.on("request", (req, res) => {
  const readable = fs.createReadStream("test.txt");
  readable.pipe(res);
});

server.listen(9000, "localhost", () => {
  console.log("Server Listening");
});
