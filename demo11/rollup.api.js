//rollup api示例

const rollup = require('rollup').rollup

const inputOptions = {
    input:'./src/index.js'
}
const outputOptions = {
    file:'dist/index.cjs.js',
    format:'cjs',
    sourcemap:true
}

async function build(){
    //rollup返回一个promise
    const bundle = await rollup(inputOptions)

    /**
     * bundle包含一些属性，下面打印出来看下
     * cache，watchFiles，generate,write
     */
    console.log(bundle);

    /**
     * generate方法提供编译功能，返回一个promise,
     * 包含编译后的代码和一些属性
     */
    const {output} = await bundle.generate(outputOptions);
    console.log(output)


    //调用bundle方法写入文件
    await bundle.write(outputOptions);
}

build();