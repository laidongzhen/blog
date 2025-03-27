# 学习Vue3源码重点提要

1. 自顶向下粗略了解思想：整体项目架构
2. 关键包与职责：compiler-core、compiler-dom、compiler-sfc、reactivity、runtime-core、runtime-dom
3. 核心过程：编译时 -> 运行时 -> 响应式数据 -> dom渲染
4. 数据结构与算法：WeakMap、位运算（patch、shape、slot）等



# 【初中级】面试官：请说说你对Vue3响应式的理解

早期没有诸如 React、Vue 这类库时，我们都采用事件驱动的实现方式开发功能，即:用户触发事件，修改变量，而后操作 dom 将变量值反映到页面上。

## 1、事件驱动

假设我们有一个按钮，点击按钮后会在页面上添加一个新的段落。

HTML:

```html
<!DOCTYPE html>
<html>
<head>
	<title>D0M 操作示例</title>
</head>
<body>
	<button id="add-paragraph">添加段落</button>
	<div id="content"></div>

	<script src="script.js"></script>
</body>
</htm1>
```



JavaScript（script.js）

```JavaScript
document.getElementById('add-paragraph').addEventlistener('click', function(){
	const newParagraph=document.createElement('p');
	newParagraph.textContent="添加一个新的段落";
	document.getElementById("content").appendchild(newParagraph);
});
```

在这个例子中，我们直接通过 DOM API操作页面元素，这种方式在项目规模较小、页面逻辑较简单时比较方便。

但当页面变得复杂时，手动管理 DOM 会变得繁琐且容易出错。

## 2、状态驱动

通过Vue3实现

```vue
<template>
    <div>
        <button @click="addParagraph">添加段落</button>
        <div id="content">
            <p v-for="(paragraph,index) in paragraphs" :key="index">{{ paragraph}}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const paragraphs = ref(['段落1', '段落2'])

const addParagraph = () => {
    paragraphs.value.push(`段落${paragraphs.value.length + 1}`)
}

</script>

<style scoped>
button {
    margin-bottom: 20px;
}
</style>
```



## 3、区别与优势对比

### 代码结构与可维护性

DOM 操作:

- 代码结构:直接操作 DOM 的代码往往是命令式的，需要明确地告诉浏览器每一步应该做什么。这种代码结构可能会变得复杂和难以管理，特别是当应用变得庞大时。
- 可维护性:由于直接操作 DOM 的代码缺乏结构化，代码的可维护性较差。任何对页面结构的更改都需要在多个地方同步修改，容易导致错误。



Vue :

- 代码结构:Vue 提供了声明式的代码风格，开发者只需描述最终的状态，Vue 会自动处理 DOM 操作。组件化的设计使代码结构清晰，每个组件负责特定的功能。
- 可维护性:组件化和声明式代码使得 Vue 的代码更易于维护，修改一个组件不会影响其他组件，且组件之间的依赖关系明确，维护成本低。

### 状态管理

DOM 操作:

- 状态管理:在直接操作 DOM 的情况下，状态管理通常依赖于全局变量或者在 DOM 元素上存储数据。随着状态的复杂度增加，管理这些状态变得非常困难。
- 同步问题:手动管理状态同步可能会导致状态不一致和难以调试的问题。



Vue :

- 状态管理:Vue 提供了响应式的数据绑定，数据和视图自动同步。使用 ref、reactive 等工具，开发者可以轻松管理组件内部状态。
- 全局状态管理:Vue 生态系统中还有 Vuex 这样的状态管理库，方便管理全局状态，并且提供了时间旅行调试等高级功能。



### 性能

DOM 操作:

- 性能优化:直接操作 DOM 的性能取决于实现的具体细节。高频繁的 DOM 操作会导致重排和重绘，影响性能。
- 细粒度控制:开发者可以对每一个 DOM 操作进行细粒度的优化，但需要较高的开发成本和经验。



Vue ：

- 性能优化:Vue 通过响应式减少了直接 DOM 操作的次数，提高了性能。Vue 的 diff 算法可以高效地比较新旧虚拟 DOM，最小化更新范围。
- 自动优化:Vue 提供了许多性能优化机制，如懒加载、异步组件等，开发者无需过多关注底层优化细节。



### 开发效率

DOM 操作:

- 开发效率:直接操作 DOM 通常需要编写大量的样板代码，开发效率较低。特别是在复杂的应用中，开发和调试过程可能会非常繁琐。
- 调试困难:由于缺乏结构化和工具支持，调试和查找问题变得困难。



Vue：

- 开发效率:Vue 提供了许多开发工具，如 Vue CL、Vue DevTools 等，大大提高了开发效率。组件化开发模式和模板语法简化了代码编写。
- 生态系统:Vue 生态系统丰富，提供了许多开箱即用的库和插件，进一步提升了开发效率。



### 结论

综上所述，使用 Vue 进行开发相比直接操作 DOM 有着显著的优势:

代码结构与可维护性:Vue 的组件化和声明式编程使得代码结构更清晰，维护更简单。

状态管理:Vue 的响应式数据绑定和 Pinia 等状态管理工具使状态管理变得简单且高效。

性能:Vue 的虚拟 DOM 技术和内置优化机制使得应用性能更高。

开发效率:Vue 提供了强大的开发工具和丰富的生态系统，大幅提高了开发效率。



## 4、手写实现简版Vue3核心源码

### 储备知识

- Proxy
- Reflect
- Set
- 发布订阅模式

> Reflect解析
>
> Reflect.js 是 JavaScript 中的一个内置对象，它提供了拦截 JavaScript 操作的方法，这些方法与 `Proxy` 对象的 handler 方法相同。`Reflect` 对象不是一个构造函数，因此不能通过 `new` 运算符对其进行调用，或者将 `Reflect` 对象作为一个函数来调用。`Reflect` 的所有属性和方法都是静态的（就像 `Math` 对象）。
>
> ### Reflect.get(target, key)
> `Reflect.get` 方法用于获取对象上某个属性的值，类似于 `target[key]`，但它以函数的形式提供反射语义。
>
> #### 语法
> ```javascript
> Reflect.get(target, propertyKey[, receiver])
> ```
>
> #### 参数
> - `target`：要获取属性的目标对象。
> - `propertyKey`：要获取的属性的名称。
> - `receiver`（可选）：当遇到 getter 方法时，提供的 `this` 值。
>
> #### 返回值
> 返回获取到的属性值。
>
> #### 异常
> 如果 `target` 不是对象，会抛出 `TypeError`。
>
> #### 示例
> ```javascript
> const object1 = {
>   x: 1,
>   y: 2,
> };
> 
> console.log(Reflect.get(object1, "x")); // 输出：1
> 
> const array1 = ["zero", "one"];
> console.log(Reflect.get(array1, 1)); // 输出："one"
> ```
>
> ### Reflect.set(target, key, value)
> `Reflect.set` 方法用于将值分配给属性，类似于 `target[key] = value`，但它以函数的形式提供反射语义。
>
> #### 语法
> ```javascript
> Reflect.set(target, propertyKey, value[, receiver])
> ```
>
> #### 参数
> - `target`：要设置属性的目标对象。
> - `propertyKey`：要设置的属性的名称。
> - `value`：要设置的值。
> - `receiver`（可选）：当遇到 setter 方法时，提供的 `this` 值。如果提供且 `target` 没有 setter，属性将设置在 `receiver` 上。
>
> #### 返回值
> 一个布尔值，表示设置属性是否成功。
>
> #### 异常
> 如果 `target` 不是对象，会抛出 `TypeError`。
>
> #### 示例
> ```javascript
> const object1 = {};
> Reflect.set(object1, "property1", 42);
> console.log(object1.property1); // 输出：42
> 
> const array1 = ["duck", "duck", "duck"];
> Reflect.set(array1, 2, "goose");
> console.log(array1[2]); // 输出："goose"
> ```
>
> ### Reflect.get 和 Reflect.set 的区别与联系
> `Reflect.get` 和 `Reflect.set` 都是 `Reflect` 对象的静态方法，用于操作对象的属性。它们的区别在于：
> - `Reflect.get` 用于获取属性值，而 `Reflect.set` 用于设置属性值。
> - `Reflect.get` 返回属性值，而 `Reflect.set` 返回一个布尔值，表示设置是否成功。
>
> 它们的联系在于，它们都提供了对对象属性操作的反射能力，并且都可以在 `Proxy` 对象的 handler 中使用，以实现对属性访问和赋值的拦截和自定义行为。
>
> ### 使用场景
> `Reflect.get` 和 `Reflect.set` 在以下场景中非常有用：
> 1. **拦截对象属性操作**：在 `Proxy` 对象的 handler 中，可以使用它们来拦截和自定义对象属性的访问和赋值行为。
> 2. **动态操作对象属性**：当需要动态地获取或设置对象属性时，使用它们可以提供更灵活的控制。
> 3. **错误处理和调试**：它们可以提供更细粒度的控制和错误处理能力，方便进行调试和错误处理。
>
> 通过合理使用 `Reflect.get` 和 `Reflect.set`，可以更灵活地操作 JavaScript 对象的属性，实现更复杂和强大的功能。



> WeakMap
>
> WeakMap 是 JavaScript 中的一种数据结构，它类似于 Map，但有一些重要的区别。以下是 WeakMap 的详细用法：
>
> ### 创建 WeakMap
> ```javascript
> const weakMap = new WeakMap();
> ```
> 也可以在创建时传入一个可迭代对象，其中每个元素是一个键值对数组：
> ```javascript
> const entries = [[obj1, "value1"], [obj2, "value2"]];
> const weakMap = new WeakMap(entries);
> ```
>
> ### 添加键值对
> 使用 `set(key, value)` 方法向 WeakMap 中添加键值对：
> ```javascript
> const obj = {};
> weakMap.set(obj, "some value");
> ```
> 注意，键必须是对象，不能是原始值（如字符串、数字等），否则会抛出错误。
>
> ### 获取值
> 使用 `get(key)` 方法根据键获取对应的值：
> ```javascript
> const value = weakMap.get(obj); // 返回 "some value"
> ```
> 如果键不存在于 WeakMap 中，则返回 `undefined`。
>
> ### 检查键是否存在
> 使用 `has(key)` 方法检查某个键是否存在于 WeakMap 中：
> ```javascript
> const exists = weakMap.has(obj); // 返回 true
> ```
>
> ### 删除键值对
> 使用 `delete(key)` 方法删除指定的键值对：
> ```javascript
> weakMap.delete(obj); // 删除键 obj 及其对应的值
> ```
>
> ### WeakMap 的特点
> - **键必须是对象**：与 Map 不同，WeakMap 的键只能是对象，不能是原始值。
> - **弱引用**：WeakMap 中的键是弱引用的，这意味着如果一个对象仅作为 WeakMap 的键存在，而没有其他引用，那么它将被垃圾回收机制自动回收，对应的键值对也会从 WeakMap 中删除。
> - **不可枚举**：WeakMap 不支持迭代，也没有 `keys()`、`values()` 和 `entries()` 方法，因此无法获取 WeakMap 中的所有键或值。
>
> ### WeakMap 的应用场景
> - **缓存**：当对象被垃圾回收时，对应的缓存数据也会自动清除，避免内存泄漏。
> - **额外数据存储**：为对象添加额外的数据，这些数据的生命周期与对象的生命周期绑定。
> - **模拟私有属性**：利用 WeakMap 的不可枚举特性，可以模拟对象的私有属性。
> - **深拷贝**：在深拷贝过程中，使用 WeakMap 记录已经拷贝过的对象，避免循环引用问题。
>
> ### 示例
> ```javascript
> // 缓存示例
> const cache = new WeakMap();
> 
> function process(obj) {
>   if (!cache.has(obj)) {
>     const result = /* 计算结果 */;
>     cache.set(obj, result);
>   }
>   return cache.get(obj);
> }
> 
> // 模拟私有属性
> const _privateData = new WeakMap();
> 
> class MyClass {
>   constructor(data) {
>     _privateData.set(this, data);
>   }
> 
>   getPrivateData() {
>     return _privateData.get(this);
>   }
> }
> ```
>
> 通过合理使用 WeakMap，可以更高效地管理对象的生命周期和数据存储，避免内存泄漏，并实现更灵活的数据结构设计。



> 发布订阅模式
>
> 发布订阅模式（也称为观察者模式）是一种设计模式，用于在软件开发中实现对象之间的松散耦合。在这种模式中，一个对象（发布者）维护一系列依赖它的对象（订阅者），当发布者发生改变时，会通知所有订阅者。
>
> ### 核心概念
> - **发布者（Subject）**：维护一系列订阅者，并在状态改变时通知它们。
> - **订阅者（Observer）**：依赖于发布者的对象，当发布者状态改变时，会收到通知并做出相应反应。
>
> ### JavaScript 中的实现
> 在 JavaScript 中，可以使用 `EventEmitter` 类（在 Node.js 中）或自定义的事件系统来实现发布订阅模式。以下是一个简单的实现：
>
> ```javascript
> class EventEmitter {
>   constructor() {
>     this.subscribers = {};
>   }
> 
>   // 订阅事件
>   subscribe(event, callback) {
>     if (!this.subscribers[event]) {
>       this.subscribers[event] = [];
>     }
>     this.subscribers[event].push(callback);
>     return () => this.unsubscribe(event, callback);
>   }
> 
>   // 取消订阅事件
>   unsubscribe(event, callback) {
>     if (!this.subscribers[event]) return;
>     this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
>   }
> 
>   // 发布事件
>   emit(event, ...args) {
>     if (!this.subscribers[event]) return;
>     this.subscribers[event].forEach(callback => callback(...args));
>   }
> }
> 
> // 使用示例
> const eventEmitter = new EventEmitter();
> 
> // 订阅事件
> const unsubscribe = eventEmitter.subscribe('greeting', (name) => {
>   console.log(`Hello, ${name}!`);
> });
> 
> // 发布事件
> eventEmitter.emit('greeting', 'Alice'); // 输出：Hello, Alice!
> 
> // 取消订阅
> unsubscribe();
> eventEmitter.emit('greeting', 'Bob'); // 不会输出任何内容
> ```
>
> ### 使用场景
> 发布订阅模式在以下场景中非常有用：
> 1. **事件处理**：在用户界面开发中，处理用户的点击、键盘输入等事件。
> 2. **异步任务协调**：在多个异步任务之间进行协调，确保任务按顺序执行。
> 3. **模块间通信**：在大型应用中，不同模块之间需要相互通信，但又不想直接耦合。
> 4. **状态管理**：在状态管理库（如 Redux）中，监听状态的变化并更新视图。
>
> ### 优点
> - **松散耦合**：发布者和订阅者之间没有直接依赖，可以独立开发和测试。
> - **灵活性**：可以动态地添加或移除订阅者。
> - **可扩展性**：可以很容易地添加新的事件类型和订阅者。
>
> ### 缺点
> - **过度使用**：如果过度使用，会导致代码难以理解和维护。
> - **内存泄漏**：如果订阅者没有正确取消订阅，可能会导致内存泄漏。
>
> 通过合理使用发布订阅模式，可以构建更加灵活和可维护的 JavaScript 应用程序。



### 依赖追踪系统

首先，我们需要一个依赖追踪系统，用于追踪依赖并在数据变化时通知相关副作用函数。

```js
	// 简单的依赖追踪系统
    class Dep {
        constructor() {
            this.subscribers = new Set();
        }

        depend() {
            if (activeEffect) {
                this.subscribers.add(activeEffect);
            }
        }

        notify() {
            this.subscribers.forEach(effect => effect().update());
        }
    }
```



### Watcher实现

Watcher类用于管理副作用函数，并在数据变化时重新执行副作用函数。

```js
    let activeEffect = null;

    class Watcher {
        constructor(effect) {
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
```



### 创建响应式对象

实现一个reactive函数，将一个普通对象转换为一个响应式对象。我们使用Proxy来拦截对象的get和set操作，从而实现依赖收集和通知。

```js
    const targetMap = new WeakMap();

    function getDep(target, key) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Dep();
            depsMap.set(key, dep);
        }

        return dep;
    }

    function reactive(target) {
        const handler = {
            get(target, key, receiver) {
                const dep = getDep(target, key);
                dep.depend();
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                const result = Reflect.set(target, key, value, receiver);
                const dep = getDep(target, key);
                dep.notify();
                return result;
            }
        };

        return new Proxy(target, handler);
    }
```



### 更新DOM视图

我们需要一个render函数来更新DOM视图。当响应式数据发生变化时，这个函数将重新渲染视图。

```js
// 渲染函数
    function render() {
        document.getElementById('count-display').innerText = `count is : ${state.count}`;
    }
```



### 完整实现

现在我们将所有部分整合起来，通过effect函数来监控响应式数据的变化，并在数据变化时调用render函数更新视图。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reactive System with Vue3</title>
    <!-- 使用 Vue3 的响应式系统 -->
</head>
<body>
    <div id="app">
        <p id="count-display"></p>
        <button id="increment-btn">Increment</button>
    </div>
</body>

<script>
    // 简单的依赖追踪系统
    class Dep {
        constructor() {
            this.subscribers = new Set();
        }

        depend() {
            if (activeEffect) {
                this.subscribers.add(activeEffect);
            }
        }

        notify() {
            this.subscribers.forEach(effect => effect().update());
        }
    }

    let activeEffect = null;

    class Watcher {
        constructor(effect) {
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

    const targetMap = new WeakMap();

    function getDep(target, key) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Dep();
            depsMap.set(key, dep);
        }

        return dep;
    }

    function reactive(target) {
        const handler = {
            get(target, key, receiver) {
                const dep = getDep(target, key);
                dep.depend();
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                const result = Reflect.set(target, key, value, receiver);
                const dep = getDep(target, key);
                dep.notify();
                return result;
            }
        };

        return new Proxy(target, handler);
    }

    // 使用实现的响应式系统
    const count = reactive({ count: 0 });

    // 渲染函数
    function render() {
        document.getElementById('count-display').innerText = `count is : ${state.count}`;
    }

    // 注册副作用函数
    effect(() => {
        render();
    });

    // 按钮点击事件
    document.getElementById('increment-btn').addEventListener('click', () => {
        count.count++;
    })

</script>
</html>
```

通过以上步骤，我们实现了一个简单的Vue3响应式系统，并在响应数据变化时自动更新DOM视图。通过effect监控响应式数据，结合render函数实现视图更新，当按钮点击时修改state.count,视图会自动重新渲染。



## 5、Vue2与Vue3响应式实现对比

如果要回答Vue2和Vue3的响应式实现区别，请讲Proxy 与 Object.defineProperty 进行详细对比。



### Vue2 响应式实现

在Vue2中，响应式系统是基于Object.defineProperty 和依赖追踪来实现的。每个响应式对象的属性通过getter和setter方法来进行拦截。

1. 依赖追踪（Dep）

   - Vue2使用Dep类来管理依赖收集和通知。

   - 每个响应式对象的属性都会有一个对应的Dep实例。

   - 在getter中收集依赖，在setter中通知依赖。

2. Observer

   - Vue2使用Observer类来将对象的每个属性转换为响应式。
   - 通过递归的方式，将对象的每一层都转换为响应式。

3. Watcher

   - Watcher是响应式系统的核心，负责依赖收集和响应式更新。
   - 每个组件实例化时，都会创建相应的Watcher实例。


```js
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
```



### Vue3 响应式实现

在Vue3中，响应式系统是基于ES6的Proxy对象实现的，这使得其更强大和灵活。

1.依赖追踪（Dep）

- 和Vue2类似，Vue3也使用Dep类来管理依赖收集和通知，但其实现更加简洁。
- 每个响应式对象的属性通过Proxy拦截。

2.Reactive和Effect

- Vue3使用reactive函数将普通对象转换为响应式对象。
- effect函数用于注册副作用函数，当响应式对象的属性变化时，自动重新运行该副作用函数。



```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reactive System with Vue3</title>
    <!-- 使用 Vue3 的响应式系统 -->
</head>
<body>
    <div id="app">
        <p id="count-display"></p>
        <button id="increment-btn">Increment</button>
    </div>
</body>

<script>
    // 简单的依赖追踪系统
    class Dep {
        constructor() {
            this.subscribers = new Set();
        }

        depend() {
            if (activeEffect) {
                this.subscribers.add(activeEffect);
            }
        }

        notify() {
            this.subscribers.forEach(effect => effect().update());
        }
    }

    let activeEffect = null;

    class Watcher {
        constructor(effect) {
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

    const targetMap = new WeakMap();

    function getDep(target, key) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            depsMap = new Map();
            targetMap.set(target, depsMap);
        }

        let dep = depsMap.get(key);
        if (!dep) {
            dep = new Dep();
            depsMap.set(key, dep);
        }

        return dep;
    }

    function reactive(target) {
        const handler = {
            get(target, key, receiver) {
                const dep = getDep(target, key);
                dep.depend();
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                const result = Reflect.set(target, key, value, receiver);
                const dep = getDep(target, key);
                dep.notify();
                return result;
            }
        };

        return new Proxy(target, handler);
    }

    // 使用实现的响应式系统
    const count = reactive({ count: 0 });

    // 渲染函数
    function render() {
        document.getElementById('count-display').innerText = `count is : ${state.count}`;
    }

    // 注册副作用函数
    effect(() => {
        render();
    });

    // 按钮点击事件
    document.getElementById('increment-btn').addEventListener('click', () => {
        count.count++;
    })

</script>
</html>
```



### 区别对比总结

1. 实现方式

   - Vue2: 使用Object.defineProperty 实现响应式，只能拦截对象已有的属性，不能处理新添加的属性或者删除属性。所以源码中重写了数组与对象操作原型方法。

   - Vue3: 使用Proxy 实现响应式，可以拦截对象的任意操作，包括动态添加和删除属性。

2. 性能和灵活性

   - Vue2: 由于Object.defineProperty 的限制，对象深层嵌套结构和数组的处理相对复杂，性能也受到一定影响。

   - Vue3: proxy提供了更高的性能和灵活性，能够处理更多场景，并且对深层嵌套对象和数组的处理更为高效。

3. API设计

   - Vue2: 响应式API较为有限，主要通过data选项和watch选项实现。

   - Vue3: 引入了reactive、ref、computed和effect等更丰富的API，使得响应式系统更易于使用和扩展，支持更灵活的组合式API。

4. 对数组和嵌套对象的处理

   - Vue2: 需要特殊处理数组和嵌套对象，复杂性较高。

   - Vue3: Proxy使得对数组和嵌套对象的处理更为简单和高效。



# 【中高级】面试官：结合Vue3 Composition API 说说你对函数式编程思想的理解

需要搞清楚，这是两个问题！

其一：函数式编程思想，FP

其二：Composition API 设计



## 函数式编程思想

函数式编程（Functional Programming，PF）是一种编程范式，它将计算过程视为数学函数的计算，并且强调不变性和纯函数。FP的核心思想包括：

1、纯函数：函数的输出只依赖与输入参数，并且不产生副作用。

2、不可变性：数据不可变，所有的数据修改都会产生新的数据副本。

3、高阶函数：可以将函数作为参数传递给另一个函数，或者将函数作为返回值返回。

4、函数组合：通过将小的函数组合在一起，构建更复杂的功能。



最经典的一个面试考题，也是redux源码中的一个函数，compose，这个函数太重要了，在实现中间件、拦截器颇为有用。

```js
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
```



## Vue3 Composition API 与函数式编程

Vue3引入了Composition API，它提供了一种更灵活的方式来组合和复用逻辑，这种方式与函数式编程的思想非常契合。

> 最终目的，还是追求将UI与状态充分解耦。



### 纯函数与计算属性

Composition API中的computed是一个纯函数的例子。计算属性饿值完全依赖于它的依赖项，并且不会产生副作用。

```js
import {ref, computed} from 'vue'

const count = ref(0)
const doubleCount computed(() => count.value * 2)
```



### 不可变性与状态管理

在Vue3中，我们可以使用ref和reactive创建响应式状态。尽管Vue的响应式系统本身是可变的，我们仍可以通过合理的状态管理策略来保持状态的不可变性。例如，在状态更新时生成新的状态对象，而不是直接修改原始状态：

```js
import {reactive} from 'vue'

const state = reactive({count:0})

function increment() {
    state.count += 1
}
```



### 高阶函数与组合函数

Vue3的Composition API 非常适合高阶函数和组合函数的使用。例如，我们可以创建一个自定义Hook，它接收一个参数并返回一个组合了特定逻辑的响应式状态：

```js
import {ref, onMounted} from 'vue'

function useFetch(url) {
    const data = ref(null)
    const error = ref(null)

    onMounted(async () => {
        try {
            const response = await fetch(url)
            data.value = await response.json()
        } catch (err) {
            error.value = err
        }
    })

    return {
        data,
        error
    }
}

const { data, error } = useFetch('https://api.example.com/data')

export default {
    setup() {
        return {
            data,
            error
        }
    }
}
```



### 函数组合与逻辑复用

通过组合多个小函数，可以构建更复杂的逻辑。例如，使用多个自定义Hook来复用逻辑：

```js
function useCounter() {
  const count = ref(0);
  const increment = () => {
    count.value++;
  };
  return {
    count,
    increment,
  };
}

function useDoubleCounter() {
  const { count, increment } = useCounter();
  const doubleCount = computed(() => count.value * 2);
  return {
    count,
    doubleCount,
    increment,
  };
}

const {count, doubleCount, increment} = useDoubleCounter();
```











