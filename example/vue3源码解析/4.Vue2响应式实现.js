// 定义一个Dep类，用于依赖收集
class Dep {
  // 构造函数，初始化一个空的subs数组
  constructor() {
    this.subs = [];
  }

  // 添加一个依赖
  addSub(sub) {
    // 将依赖添加到subs数组中
    this.subs.push(sub);
  }
  
  // 通知所有依赖更新
  notify() {
    // 遍历subs数组，调用每个依赖的update方法
    this.subs.forEach((sub) => sub.update());
  }
}

class Watcher {
  // 构造函数，接收三个参数：vm（Vue实例），expOrFn（要监听的属性或方法），cb（回调函数）
  constructor(vm, expOrFn, cb)  {
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.cb = cb;
    // 调用get方法，获取初始值
    this.value = this.get();
  }

  // 获取初始值
  get() {
    // 将当前Watcher实例赋值给Dep.target
    Dep.target = this;
    // 获取当前vm实例的expOrFn属性的值
    const value = this.vm[this.expOrFn];
    // 将Dep.target置为null
    Dep.target = null;
    // 返回获取到的值
    return value;
  }

  // 更新方法
  update() {
    // 获取当前vm实例的expOrFn属性的值
    const value = this.vm[this.expOrFn];
    // 获取当前Watcher实例的value属性的值
    const oldValue = this.value;
    // 如果新值与旧值不相等，则调用回调函数
    if (value !== oldValue) {
      this.value = value;
      this.cb.call(this.vm, value, oldValue);
    }
  }
}

// 定义一个响应式函数，用于将对象中的属性转换为响应式属性
function defineReactive(obj, key, val) {
    // 创建一个Dep实例，用于管理依赖
    const dep = new Dep();
    // 使用Object.defineProperty将属性转换为响应式属性
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 如果Dep.target存在，则将Dep.target添加到dep的订阅者列表中
        if (Dep.target) {
          dep.addSub(Dep.target);
        }
        // 返回属性的值
        return val;
      },
      set(newVal) {
        // 如果新值和旧值相等，则不进行任何操作
        if (newVal === val) return;
        // 更新属性的值
        val = newVal;
        // 通知dep的所有订阅者属性值已更新
        dep.notify();
      },
    });
}

// 定义一个函数observe，用于观察一个对象
function observe(value) {
    // 如果value不存在或者不是对象，则直接返回
    if (!value || typeof value !== 'object') {
      return;
    }
    // 遍历value对象的每一个属性
    Object.keys(value).forEach((key) => defineReactive(value, key, value[key]));
}

class Vue {
    // 构造函数，接收一个options参数
    constructor(options) {
        // 将options中的data属性赋值给Vue实例的data属性
        this.data = options.data;
        // 调用observe函数，将data属性进行响应式处理
        observe(this.data);
        // 创建一个Watcher实例，监听message属性的变化，当message属性发生变化时，执行回调函数
        new Watcher(this, 'message', (newVal, oldVal) => {
            console.log('message changed:', newVal, oldVal);
        })
    }
}

const vm = new Vue({
    data: {
        message: 'Hello Vue!'
    }
})

vm.data.message = 'Hello World!';
// 输出message changed:Hello World!