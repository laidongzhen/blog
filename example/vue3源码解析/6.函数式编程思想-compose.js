// 作用是将多个函数组合成一个函数。
// 这个组合后的函数会按照从右到左的顺序执行传入的函数，
// 每个函数的输出作为下一个函数的输入。

// 定义一个函数compose，接收任意数量的函数作为参数
function compose(...funcs) {
    // 如果没有传入任何函数，则返回一个函数，该函数接收任意参数并返回该参数
    if(funcs.length === 0) {
        return arg => arg
    }

    // 如果只传入了一个函数，则直接返回该函数
    if(funcs.length === 1) {
        return funcs[0]
    }

    // 使用reduce方法，将传入的函数组合成一个函数
    return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

// 示例用法
const add = x => x + 1
const multiply = x => x * 2
const subtract = x => x - 3

const composedFunction = compose(add, multiply, subtract)

console.log(composedFunction(5)) // 输出: 5
// 函数是按照从右到左的顺序执行的，即先执行subtract函数，再执行multiply函数，最后执行add函数。
// subtract: 5-3 =2
// multiply: 2*2 =4
// add: 4+1 =5