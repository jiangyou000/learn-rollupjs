//使用babel
import babel from 'rollup-plugin-babel'

export default {
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs'
    },
    plugins: [
        resolve(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
}