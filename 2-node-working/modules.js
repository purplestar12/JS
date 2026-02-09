const C1 = require("./test-module-1");
// const C2 = require("./test-module-2");

//module.exports
const calc_1 = new C1();
console.log("add : ", calc_1.add(3, 4));
console.log("mult1 : ", calc_1.multiply(3, 4));

//exports
// console.log("mult2 : ", C2.multiply(3, 4));

//export specific property of the object
const { add, sub, multiply } = require("./test-module-2");
console.log("sub : ", sub(10, 3));

require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
require("./test-module-3")();
