const {Module} = require("module")
const path = require("path")

const wat = new Module("wat", module)
wat.paths = module.paths
wat.filename = path.resolve("./src/wat")
// wat.wat = 100

// console.log(wat)
global.wat = 100
console.log(wat.require("../math.js"))
delete global.wat

console.log(wat)
