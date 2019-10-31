const path = require("path")

module.exports = {
    plugins: [
        ["babel-plugin-anchor-imports",
            {
                rootDir: path.resolve(__dirname, "src"),
                anchors: {
                    "@core": "core",
                    "@node": "node",
                    "@browser": "browser",
                    "@cli": "cli",
                },
            },
        ],
        "@babel/plugin-transform-modules-commonjs",
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining",
    ]
}
