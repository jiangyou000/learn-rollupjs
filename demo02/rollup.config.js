/**
 * 模块化打包，打包成不同模块
 */
const format_arr = ['amd', 'cjs', 'es', 'iife', 'umd']
let output_arr = format_arr.map(function(val){
    return{
        file:`dist/dist.${val}.js`,
        format:`${val}`,
        name:`my_module_name`
    }
})

export default{
    input:'./src/index.js',
    output:output_arr
}