import compact from 'lodash/compact'
import jquery from 'jquery'
import utils from './lib'
let getName = utils.getName()
console.log(getName)
const array = [0, 1, false, 2, '', 3]
const compctedArray = compact(array)
console.log(compctedArray)

console.log(jquery)