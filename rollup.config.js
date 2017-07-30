// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
    entry: './src/workerServiceManager.ts',

    external,

    plugins: [
        typescript()
    ],

    targets: [
        {
            dest: pkg.main,
            format: 'umd',
            moduleName: 'WorkerServiceManager',
            sourceMap: true
        },
        {
            dest: pkg.module,
            format: 'es',
            sourceMap: true
        }
    ],
}