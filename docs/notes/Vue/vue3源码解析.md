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

- 代码结构:Vue 提供了声明式的代码风格，开发者只需描述最终的状态，Ve 会自动处理 DOM 操作。组件化的设计使代码结构清晰，每个组件负责特定的功能。
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

### 依赖追踪系统

### Watcher实现

### 创建响应式对象

### 更新DOM视图

### 完整实现

## 5、Vue2与Vue3响应式实现对比

### Vue2 响应式实现

### Vue3 响应式实现

### 区别对比总结