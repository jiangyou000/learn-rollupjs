/**
 * 1. 代码压缩
 * 2. 生成sourcemap,
 * 3. 引入eslint
 * 4. 配置文件中区分生产开发环境
 * 5. 代码文件中区分生产开发环境
 * 6. 使用rollup-plugin-replace插件替换注入代码中的变量
 */
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import {uglify} from 'rollup-plugin-uglify'
import {eslint} from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';

let isProd = process.env.NODE_ENV === 'production'

console.log(isProd)
export default {
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs',
        sourcemap:true,
        //将所处环境变量注入到代码文件中
        // intro: 'var __dev__ = ' + !isProd,
    },
    plugins:[
        resolve(),
        commonjs(),
        eslint({
            throwOnError: true,
            throwOnWarning: true,
            include: ['src/**'],
            exclude: ['node_modules/**']
        }),
        //将代码中的__dev__变量替换为123，或者写成NODE_ENV
        replace({
            __dev__:'123'
        }),
        uglify()
    ]
}