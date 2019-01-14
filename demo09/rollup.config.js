//使用cdn上的文件
export default {
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs',
        paths:{
            jquery:'https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js'
        }
    },
    external: ['jquery']
}