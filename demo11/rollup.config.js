/**
 * 会报警告 css plugin: The ongenerate hook used by plugin css is deprecated. The generateBundle hook should be used instead.
 * rollup刚出来不久改了hooks api 这些插件还没来得及改
 * 比如这里 https://github.com/egoist/rollup-plugin-postcss/issues/147
 * 
 * 
 * 添加 css等支持，
 * 使用rollup-plugin-serve插件
 */
import postcss from 'rollup-plugin-postcss';
import scss from 'rollup-plugin-scss'
import serve from 'rollup-plugin-serve'
export default {
    input:'./src/index.js',
    output:{
        file:'build/index.iife.js',
        format:'iife',
        name:'index_iife'
    },
    plugins:[
        // postcss({
        //     extract: true,
        //     minimize: true
        // })
        scss({
            output:'build/index.iife.css'
        }),
        // serve('build')
        serve({
            contentBase: ['build'],
            open: true,
            historyApiFallback: true,
            host: '0.0.0.0',
            port: 8081,
        })
    ]
}