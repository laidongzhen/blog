// 中间人，中介
// 发布订阅模式

// 响应式核心，数据劫持

// 依赖追踪，变化之后通知我
const handler = {
  get(target, key) {
    console.log("get", target, key);
    // return target[key];
    return Reflect.get(target, key);
  },
  set(target, key, value) {
    console.log("set", target, key, value);
    // target[key] = value;
    Reflect.set(target, key, value);

    // 这里还是没有撇开关系
    render();
  },
};

// 只能算是一个响应式数据的实现，远远称不上响应式系统
const obj = {
  count: 0,
};

// 监听 obj 任何属性的变更
const proxyObj = new Proxy(obj, handler);

// proxyObj.name; // 触发 get
// proxyObj.name = "妙码"; // 触发 set

document.body.addEventListener("click", () => {
  proxyObj.count++;
});

// 渲染数据
function render() {
  document.body.innerHTML = `
    <h1>${proxyObj.count}</h1>
  `;
}

// 渲染和事件，完全解耦

render();
