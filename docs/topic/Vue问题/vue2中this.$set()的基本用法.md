# vue2中this.$set()的基本用法

## 作用

1、添加响应式属性：需要在 Vue 实例中动态添加一个属性，并且希望这个属性能够触发视图更新时，可以使用 this.$set。

2、确保属性更新：在 Vue 的响应式系统中，如果对象的属性在初始化时不存在，那么即使后续通过 this 访问器添加了属性，Vue 也不会将其视为响应式属性。使用 this.$set 可以确保这些属性也是响应式的。



## 何时使用

1. 从外部数据源接收数据，并且需要将这些数据动态添加到 Vue 实例中时。
2. 使用 Vue 表单，需要动态地添加或修改表单字段时。
3. 使用 Vuex 状态管理库，需要在组件中动态添加响应式状态时。

总结：vue2中添加数组、对象、或者之前不存在的属性时使用。

注：有时候对数据赋值，在页面上修改数据，值不改变，需要视图更新后数据才对应更新，可能是因为赋值时没有使用set，导致失去响应式。



## 语法

1、**基本用法**

```js
this.$set(target, propertyName/index, value)

（1）target: 要更改的数据源（可以是一个对象或者数组）

（2）propertyName/index: 要更改的具体对象数据 （数组索引）

（3）value: 重新赋的值(any)

例子：
this.$set(target, 'propertyName', value)
this.$set(Attay, index, value)
```

2、**在数组中使用**：向数组中添加响应式元素。

```js
this.$set(this.someArray, index, newValue);
例：
this.$set(materialDefectsDeep,materialDefectsDeep.length,addCheckedItem)
```

3、**在对象中使用**：向对象中添加响应式属性。

```js
this.$set(this.someObject, 'propertyName', propertyValue);
例：
this.$set(this.materialDefectsDeep, 'name', propertyValue);
```

4、**在 Vue 生命周期钩子中使用**：在组件的生命周期钩子中动态添加响应式属性。

```js
created() {
  this.$set(this, 'newProperty', initialValue);
}
```

**5、在计算属性中使用**：在计算属性中添加响应式属性，以确保计算属性的依赖项是响应式的。

```js
computed: {
  computedProperty() {
    this.$set(this, 'computedProperty', this.someValue);
    return this.computedProperty;
  }
}
```

6、**在方法中使用**：在组件的方法中添加响应式属性，以响应用户交互或其他事件。

```js
methods: {
  addProperty() {
    this.$set(this, 'newProperty', 'newValue');
  }
}
```

注意事项：

- `this.$set` 是 Vue 2.x 特有的方法，在 Vue 3.x 中已经被废弃，因为 Vue 3 使用了 Proxy 来实现更彻底的响应式系统。
- 使用 `this.$set` 时，确保传递的是 Vue 实例的属性，否则可能不会触发视图更新。



## 对Vue实例的理解

使用 `this.$set` 时，确保传递的是 Vue 实例的属性，否则可能不会触发视图更新。

以下是对这句话的理解：

这句话的意思是在使用 `this.$set` 方法时，你需要确保你正在操作的对象是 Vue 实例的一部分，或者是通过 Vue 实例的属性访问的对象。这样 Vue 才能检测到属性的变化并更新视图。

### 理解原因：

1. **Vue 的响应式系统**：Vue 使用一个响应式系统来跟踪依赖和更新 DOM。当响应式属性的值发生变化时，Vue 会自动更新 DOM 以反映这些变化。

2. **响应式初始化**：在 Vue 实例的初始化阶段，Vue 会递归地遍历实例的选项（如 `data`、`computed` 等），将这些选项中的属性转换为响应式属性。这意味着这些属性的任何变化都会被 Vue 检测到。

3. **动态添加属性**：如果你在实例的 `data` 对象之外动态添加属性，Vue 可能不会自动将这些属性转换为响应式属性。因此，这些属性的变化不会触发视图的更新。

### 示例说明：

假设你有一个 Vue 组件，如下所示：

```javascript
export default {
  data() {
    return {
      person: {
        name: 'John',
        age: 30
      }
    };
  },
  methods: {
    updateName() {
      // 正确使用 this.$set
      this.$set(this.person, 'name', 'Jane');
    },
    addNewProperty() {
      // 错误使用 this.$set
      this.$set(this.person, 'address', '123 Main St');
    }
  }
}
```

在这个示例中：

- `updateName` 方法正确地使用了 `this.$set` 来更新 `person` 对象的 `name` 属性。因为 `person` 是 `data` 返回的对象的一部分，所以 Vue 可以检测到这个属性的变化并更新视图。
- `addNewProperty` 方法尝试使用 `this.$set` 向 `person` 对象添加一个新属性 `address`。然而，这个属性在初始化时不存在于 `data` 中，因此 Vue 可能不会将其视为响应式属性，视图更新可能不会发生。

### 正确的做法：

为了确保 `this.$set` 能够触发视图更新，你应该确保你正在操作的对象是 Vue 实例的一部分。例如：

```javascript
export default {
  data() {
    return {
      person: {
        name: 'John',
        age: 30
      }
    };
  },
  methods: {
    updateName() {
      // 正确使用 this.$set
      this.$set(this.person, 'name', 'Jane');
    },
    addNewProperty() {
      // 正确使用 this.$set
      this.$set(this.person, 'address', '123 Main St');
      this.$set(this, 'person', this.person);
    }
  }
}
```

在这个修正后的示例中，`addNewProperty` 方法不仅使用 `this.$set` 向 `person` 对象添加了 `address` 属性，还通过 `this.$set(this, 'person', this.person);` 确保了 `person` 对象本身是响应式的。这样，`person` 对象的任何变化都会被 Vue 检测到并触发视图更新。