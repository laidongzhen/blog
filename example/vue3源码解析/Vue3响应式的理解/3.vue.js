// 响应式核心，数据劫持
// 发布订阅来实现

// 1.处理依赖追踪 Dep
// 2.处理侦听 Watcher

// ref、reactive

// 1. 我们给大家实现 reactive 方法
// 2. 依赖收集
// 3. 触发更新
// 4. Watcher
// 5. effect

// 1. 依赖收集
class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    // 当前激活的 副作用
    if (activeEffect) {
      // 将当前激活的副作用添加到订阅者列表中
      this.subscribers.add(activeEffect);
    }
  }

  // 通知所有订阅者
  notify() {
    // 遍历所有订阅者
    this.subscribers.forEach((effect) => {
      // 调用订阅者的update方法
      effect.update();
    });
  }
}


// Watcher

let activeEffect = null;

class Watcher {
  constructor(effect) {
    // 当下的副作用
    this.effect = effect;
    this.run();
  }

  run() {
    activeEffect = this;
    this.effect();
    activeEffect = null;
  }

  update() {
    this.run();
  }
}

function effect(effect) {
  new Watcher(effect);
}

// WeakMap，key 是对象
let targetMap = new WeakMap();

// 获取依赖
function getDep(target, key) {
  // 获取当前对象的依赖
  let depsMap = targetMap.get(target);
  // 判断当前是否已经加入到了依赖中
  if (!depsMap) {
    // 如果没有，则创建一个新的依赖
    depsMap = new Map();
    // 将依赖添加到targetMap中
    targetMap.set(target, depsMap);
  }

  // 获取当前key的依赖
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }

  return dep;
}

// 响应式
const reactive = (target) => {
  // 依赖追踪，变化之后通知我
  const collectionHandlers = {
    get(target, key) {
      // track deps
      // 这样理解，就是在这个劫持的操作下，进行依赖收集
      const dep = getDep(target, key);
      // track
      dep.depend();
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      const dep = getDep(target, key);
      // 触发依赖
      // trigger
      dep.notify();
      return result;
    },
  };

  return new Proxy(target, collectionHandlers);
};

// 1. 定义响应式数据
const state = reactive({
  count: 0,
});

// 2. 渲染函数
const render = () => {
  document.body.innerHTML = `
    <h1>${state.count}</h1>
  `;
};

// 3. 副作用
// 比如我感冒了，要吃药，吃完药昏昏欲睡
effect(() => {
  render();
});

// 4. 事件监听
document.body.addEventListener(
  "click",
  () => {
    state.count++;
  },
  false
);
