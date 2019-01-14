//支持导入commonjs类型的模块，不用这个插件的话导入commonjs会报错
import commonjs from 'rollup-plugin-commonjs';
//支持加载第三方模块，比如node_modules中的模块，不写会报警告
import resolve from 'rollup-plugin-node-resolve'

//不打包jquery，将其作为外部模块引用

export default {
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs',
        globals: {
            jquery: '$'
        }
    },
    external: [
        'jquery'
    ],
    plugins:[
        resolve(),
        commonjs()
    ]
}