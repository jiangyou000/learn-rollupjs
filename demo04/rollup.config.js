/**
 * 监控打包
 */
export default{
    input:'./src/index.js',
    output:{
        file:'dist/index.cjs.js',
        format:'cjs'
    },
    watch:{
        include:'src/**',
        exclude: 'node_modules/**'
    }
}