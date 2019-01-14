/**
 * 多入口打包
 */
const format_arr = ['amd', 'cjs', 'es', 'iife', 'umd']
let output_arr = (input) => {
    return format_arr.map(function(val){
        return{
            file:`dist/${input}.${val}.js`,
            format:`${val}`,
            name:`my_module_name`
        }
    })
}
export default [
    {
        input:'./src/index.js',
        output:output_arr('index')
    },
    {
        input:'./src/indexB.js',
        output:output_arr('indexB')
    }
]