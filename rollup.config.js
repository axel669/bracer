import babel from "rollup-plugin-babel"
import commonjs from "rollup-plugin-commonjs"
import resolve from "rollup-plugin-node-resolve"

export default {
    input: "src/browser/index.js",
    output: [
        {
            file: "standalone/index.js",
            format: "iife",
            name: "bracer",
        }
    ],
    plugins: [
        babel(),
        commonjs(),
        resolve(),
    ]
}
