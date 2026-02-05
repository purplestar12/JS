const EventEmitter = require("events");
const http = require("http");

class Sale extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sale();

//multiple listeners for the same event, eventName here is 'newSale'
//observers
myEmitter.on("newSale", () => {
  console.log("New sale !!");
});

myEmitter.on("newSale", () => {
  console.log("Take a Discount !!");
});

myEmitter.on("newSale", (discount) => {
  console.log(`$${discount} is your discount`);
});

//event emitting
myEmitter.emit("newSale", 10);

const server = http.createServer();

server.on("request", (req, res) => {
  console.log("url--> ", req.url);
  console.log("Requesting !!");
});

server.on("request", (req, res) => {
  console.log("Another request !!");
  res.end("Req received");
});

server.on("close", () => {
  console.log("Server closed !!");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server is listening");
});
