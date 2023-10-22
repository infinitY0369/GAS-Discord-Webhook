/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const { GasPlugin } = require("esbuild-gas-plugin")

require("esbuild").build({
    entryPoints: ["src/main.ts"],
    minify: true,
    bundle: true,
    outfile: "dist/main.js",
    plugins: [GasPlugin]
}).catch((e) => {
    console.error(e)
    process.exit(1)
})
