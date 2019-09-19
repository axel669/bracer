const {Module} = require("module")
const path = require("path")

const wat = new Module("wat", module)
wat.paths = module.paths
wat.filename = path.resolve("./src/wat")

console.log(wat)
console.log(wat.require("../math.js"))
