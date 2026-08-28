# vue中this.$emit(“update:xx“,value)和xx.sync的用法

## 例子

### 父组件

```vue
<template>
	<ChildComponent :click-index.sync="clickIndex" />
</template>
```

### 子组件

```vue
props: {
    clickIndex: {
      type: Number,
      default: -1
    }
  },
//当需要更新父组件中的值时，使用
this.$emit('update:clickIndex', value)
```

当子组件触发 `update:clickIndex` 后，会将 `value` 作为参数传递。父组件监听这个事件，更新其 `clickIndex` 数据属性。



## 用法

1. **属性绑定**：`update:clickIndex` 事件名称中的 `update:` 前缀是 Vue 2.x 中 `.sync` 修饰符的语法糖。在 Vue 3.x 中，`.sync` 修饰符已经被移除，但是这种命名约定仍然被用来表示这是一个同步事件，目的是更新父组件中的某个属性。
2. **响应式更新**：当子组件触发 `update:clickIndex` 事件时，如果父组件中有对应的监听器，并且使用了 `.sync` 修饰符或者等效的 `v-model` 绑定，父组件中的 `clickIndex` 属性将会被更新为子组件传递过来的 `index` 值。