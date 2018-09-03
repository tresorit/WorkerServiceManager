// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

let pkg = require('./package.json');
let external = Object.keys(pkg.dependencies);

export default {
  input: './src/workerServiceManager.ts',

  external,

  plugins: [
    typescript({ tsconfig: "tsconfig.json" })
  ],

  output: [
    {
      file: pkg.main,
      format: 'umd',
      name: 'WorkerServiceManager',
      sourcemap: true
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
}