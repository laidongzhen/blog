# Vue 3 在本项目中的应用详解（复习 / 面试用）

> 基于 `substation-front-v3-plus` 代码库实际统计与常见写法整理。  
> 结论先行：**本项目 Vue 3 应用最多、最核心的是 Composition API +** `script setup lang="ts"`**，其中响应式又以** `ref` **使用频率最高。**

---

## 1. 结论与仓库实况

### 1.1 一句话结论

本项目是典型的 **Vue 3 + TypeScript + Vite** 后台管理系统。业务页面几乎统一采用：

- **页面壳**：`.vue` + `script setup`
- **逻辑复用**：`hooks/useXxx.ts` 与页面旁 `useXxx.tsx`
- **全局状态**：Pinia
- **列表能力**：`BaseTable` + `columns` / `getTableList` / `dataCallback`

### 1.2 量化快照（`src` 目录粗略统计）


| 指标                                             | 大约数量               | 说明                            |
| ---------------------------------------------- | ------------------ | ----------------------------- |
| `.vue` 文件                                      | ~508               | 页面与组件主体                       |
| `script setup`                                 | ~268               | 主流写法（另有部分文件用 Options / 旧写法残留） |
| Options API `export default {`                 | ~8                 | 极少                            |
| `defineComponent`                              | ~9                 | 极少                            |
| `ref(`                                         | ~2272              | **响应式第一名**                    |
| `reactive(`                                    | ~189               | 多用于表单对象 / table state         |
| `computed(`                                    | ~212               | 派生状态                          |
| `watch(`                                       | ~256               | 副作用监听                         |
| `watchEffect(`                                 | ~6                 | 很少用                           |
| `onMounted(`                                   | ~128               | 最常见生命周期                       |
| `nextTick(`                                    | ~323               | 等 DOM 更新后再操作                  |
| `defineProps` / `defineEmits` / `defineExpose` | ~135 / ~156 / ~202 | 组件通信三件套很常见                    |
| `defineModel`                                  | 0                  | 尚未普及                          |
| `src/hooks`                                    | ~26                | 全局组合式函数                       |
| `views` 下 `use*.ts(x)`                         | ~104               | **列表页逻辑抽离的主力**                |
| Pinia `defineStore`                            | ~24                | 全局状态模块                        |


> 数字会随迭代变化，复习时抓住比例即可：`script setup` 为主，`ref` 远多于 `reactive`，组合式函数（hooks / useXxx）是项目骨架。

---



## 2. 为什么项目会选 Composition API？

对比 Options API（`data/methods/computed/watch` 分块），Composition API 更适合本仓库这种大型后台：

1. **按功能聚合，而不是按选项类型拆散**
  一个「表格查询 + 删除 + 抽屉」相关的状态与方法可以放在同一个 `useXxx` 里，而不是散落在 `data` / `methods` 多处。
2. **逻辑复用更自然**
  `usePermission`、`useTable`、`useForm`、`useDataDictionary` 等可直接在多个页面调用。
3. **TypeScript 友好**
  `ref<T>`、`reactive<T>`、`defineProps<{}>()` 类型推导更顺。
4. **配合** `script setup` **样板更少**
  顶层绑定自动暴露给模板，不必手动 `return`。

面试可说：

> 我们项目业务页面复杂、复用点多（权限、字典、表格、表单），Composition API 能把「同一业务能力」聚在一起，并用 composable 跨页面复用；Options API 更适合小组件，但大型后台维护成本更高。

---



## 3. `script setup`：本项目页面标准形态



### 3.1 基本形态

常见写法：

```vue
<script lang="ts" setup name="EnvironmentMonitor">
import { ref } from 'vue'
import useEnvironmentMonitor from './useEnvironmentMonitor'
import { usePermission } from '@/hooks/usePermission'

const { permission } = usePermission()
const tableRef = ref()

const { searchType, search, reset, columns } = useEnvironmentMonitor(/* ... */)
</script>
```

要点：

- `setup`：编译期语法糖，相当于 `setup()` 的自动展开。
- `lang="ts"`：项目标配。
- `name="Xxx"`：便于 keep-alive / 调试；部分页面会写。
- **顶层变量、函数、导入的组件** 都可直接在 template 使用。



### 3.2 典型页面分层（强烈建议记住）

以运维班组管理为例：

```
TeamsManagement/
  Index.vue              # 模板 + 少量编排（打开抽屉、调用接口）
  useTeamsManageQuery.tsx # columns / getTableList / dataCallback / 删除逻辑
  components/TeamDrawer.vue
```

`Index.vue` 负责：

- 挂 `BaseTable`
- `ref` 拿子组件实例
- 调用 `useXxx` 拿到列配置与请求函数
- 打开抽屉、提交新建/编辑

`useXxx.tsx` 负责：

- 查询参数、列定义（含 JSX `render`）
- 请求封装与 `dataCallback` 数据整形
- 删除等业务动作

这是本项目**最高频的业务组织方式**，面试被问「你们 Vue3 怎么组织代码」直接答这套。

### 3.3 编译器宏（面试高频）

`script setup` 里常用编译期宏（无需从 `vue` 导入）：


| 宏              | 作用          | 本项目情况                         |
| -------------- | ----------- | ----------------------------- |
| `defineProps`  | 声明 props    | 常用                            |
| `defineEmits`  | 声明事件        | 常用                            |
| `defineExpose` | 向父组件暴露方法/状态 | **很常用**（抽屉 `acceptParams` 模式） |
| `withDefaults` | props 默认值   | 常见                            |
| `defineModel`  | v-model 简化  | 目前基本未用                        |


父调子的项目习惯：

```ts
const teamDrawerRef = ref<InstanceType<typeof TeamDrawer>>()
teamDrawerRef.value?.acceptParams({ title: '新增班组', ... })
```

子组件通常 `defineExpose({ acceptParams })`。这比层层 props 传「打开指令」更符合本仓库弹窗/抽屉习惯。

---



## 4. 响应式核心：`ref` 为什么用得最多？



### 4.1 `ref` vs `reactive`（项目视角）


|      | `ref`                    | `reactive`                  |
| ---- | ------------------------ | --------------------------- |
| 适用   | 基本类型、DOM/组件引用、可整体替换的值    | 结构较固定的对象（表单、table state）    |
| 取值   | `.value`（模板自动解包）         | 直接读属性                       |
| 替换整体 | `xxx.value = newObj` 很自然 | 直接整体赋值会丢代理，需谨慎              |
| 本项目  | **绝对主流**                 | `useTable` 的 `state`、部分表单对象 |


项目里大量出现：

```ts
const openTree = ref(true)
const searchType = ref('environment')
const baseTable = ref()
const loading = ref(false)
```

以及组件引用：

```ts
const chartsRef = ref()
chartsRef.value?.open(...)
```

`reactive` 典型出现在 `useTable`：

```ts
const state = reactive({
  tableData: [],
  pageable: { pageNum: 1, pageSize: 10, total: 0 },
  searchParam: {},
  loading: false
})
```

因为表格状态是「一坨相关字段」，用对象聚合更合适；页面局部开关、选中 id、子组件 ref 则更适合 `ref`。

### 4.2 模板自动解包

在 template 中直接写 `count`，不必写 `count.value`。  
在 script 中访问必须 `.value`。  
面试常挖坑：**把** `ref` **传到普通函数里解构后丢失响应式**。

```ts
// 错误：解构后失去响应式
const { loading } = stateLikeRefObject

// 正确：保持 ref，或用 toRefs(reactiveObj)
```

本项目 `toRefs` 使用极少，说明更多是「直接用 ref / 直接用 reactive 对象属性」，较少做解构导出。

### 4.3 `computed` / `watch` / `watchEffect`

- `computed`：派生数据（权限可见列、拼接展示字段、分页参数等）。
- `watch`：监听站点切换、查询条件变化后重新拉数；比 `watchEffect` 更可控。
- `watchEffect`：本仓库几乎不用；默认立即执行、依赖收集不够显式，复杂业务更倾向 `watch`。

记忆口诀：

> 能算出来的用 `computed`；要「因变化而做事」用 `watch`；不要上来就 `watchEffect`。



### 4.4 `nextTick`

统计上 `nextTick` 使用很多，原因：后台系统频繁操作表格、弹窗、ECharts、视频组件，需要 **等 DOM / 子组件挂载更新后再调实例方法**。

典型场景：

1. `v-if` 刚把图表打开，立刻调 `chart.resize()`
2. 打开抽屉后聚焦输入框
3. 表格数据刷新后滚动或选中行

---



## 5. 组合式函数（Composables）：项目真正的「复用层」



### 5.1 两层 composable

1. **全局 hooks**：`src/hooks/`
  例：`usePermission`、`useForm`、`useTable`、`useDataDictionary`
2. **页面级 useXxx**：放在页面目录旁
  例：`useTeamsManageQuery.tsx`、`useEnvironmentMonitor.ts`

约定：

- 函数名以 `use` 开头
- 内部可自由使用 `ref/reactive/computed/watch/生命周期`
- 返回页面需要的状态与方法（对象解构使用）



### 5.2 列表页标准契约（面试非常加分）

配合 `BaseTable` 时，页面 `useXxx` 通常提供：

```ts
const getTableList = async (params?) => { /* 调接口 */ }
const dataCallback = (data) => ({
  list,
  total,
  pageNum,
  pageSize
})
const columns: ColumnProps[] = [ /* prop/label/search/render */ ]
```

这与 AGENTS.md 描述一致：`getTableList` 透传分页查询；`dataCallback` 把后端 `items/totalCount` 转成表格协议。

### 5.3 为什么列表逻辑常写成 `.tsx`？

因为 `columns` 里经常用 JSX `render`：

```tsx
render: (scope) => {
  return <el-tag type={scope.row.address ? 'success' : 'warning'}>
    {scope.row.address ? '已上传' : '未上传'}
  </el-tag>
}
```

`.tsx` 让列渲染更紧凑；`.vue` 则更适合模板结构与样式。

---



## 6. 组件通信在本项目中的优先级

从高频到低频：

1. **Props down / Emits up**
  基础父子通信。
2. `ref` **+** `defineExpose`
  父调用子方法（抽屉、弹窗、图表）。**业务里非常常见。**
3. **Pinia**
  跨页、跨布局的全局状态（布局、主题、systemEnv、权限相关 store 等）。
4. **mittBus**
  轻量事件总线，用于解耦通知（部分页面存在）。
5. **provide / inject**
  本仓库使用很少，不是主流。

面试话术：

> 默认 props/emits；需要命令式打开子组件就 expose；跨页面状态用 Pinia；偶发解耦用 event bus；避免滥用 provide/inject。

---



## 7. 生命周期（Composition API 映射）


| Options API                | Composition API       |
| -------------------------- | --------------------- |
| `beforeCreate` / `created` | `setup` 本身（同步代码即创建阶段） |
| `beforeMount`              | `onBeforeMount`       |
| `mounted`                  | `onMounted`           |
| `beforeUpdate`             | `onBeforeUpdate`      |
| `updated`                  | `onUpdated`           |
| `beforeUnmount`            | `onBeforeUnmount`     |
| `unmounted`                | `onUnmounted`         |


本项目最常见：`onMounted` 拉树、拉字典、初始化表格。  
有 WebSocket / 定时器 / 图表实例时，务必在 `onUnmounted` 清理，避免泄漏。

---



## 8. Pinia 在项目中的位置

- Store 定义在 `src/stores/modules/`
- `id` 带 `storePrefix`（如 `substation-global`）
- 需要持久化的字段走 `piniaPersist` / 配置白名单

与 Vuex 对比（面试常问）：


|          | Vuex         | Pinia                        |
| -------- | ------------ | ---------------------------- |
| Mutation | 必须           | **不需要**，可直接改 state 或 actions |
| TS 支持    | 一般           | 更好                           |
| 模块拆分     | modules 嵌套复杂 | 多 store 更自然                  |
| 体积/心智    | 重            | 轻                            |


本项目已全面 Pinia，新功能不要再引入 Vuex 思路。

---



## 9. 与 Vue 2 / Options API 的关键差异（复习清单）

1. **响应式系统**：Proxy（Vue3）替代 Object.defineProperty（Vue2）
  - 可监听新增/删除属性、数组索引变化更完整
2. **碎片化 API → 组合式 API**
3. **多个根节点**：Vue3 支持 Fragment
4. **Tree-shaking**：按需引入 API，打包更友好
5. **Teleport / Suspense**：本仓库业务页用得不多，知道概念即可
6. `script setup` 成为事实标准写法

---



## 10. 结合本项目的「推荐心智模型」

做新页面时按这个顺序想：

```
1. 路由是否已有？权限码是什么？
2. Index.vue：布局（左树右表 / 纯表）+ Base 组件拼装
3. useXxx：请求、列、回调、业务动作
4. 子抽屉/弹窗：defineExpose(acceptParams)
5. 全局能力：usePermission / 字典 / Pinia
6. 需要 DOM 更新后操作：nextTick
```

响应式选择口诀：

```
单个值 / 组件实例 → ref
一组强相关字段且结构稳定 → reactive
由已有状态推导 → computed
变化后发请求/改别的状态 → watch
```

---



## 11. 高频面试题梳理（含参考答）



### A. 基础概念题



#### Q1. Vue3 相对 Vue2 最大变化是什么？

**答：**  
响应式从 `Object.defineProperty` 换成 `Proxy`；推出 Composition API；更好的 TypeScript 支持；支持 Fragments、Teleport；打包可 Tree-shaking。对业务项目而言，最大工程收益是 **逻辑复用与 TS 体验**。

#### Q2. 什么是 Composition API？和 Options API 区别？

**答：**  
Composition API 用函数组合状态与逻辑（`ref/reactive/computed/watch` + composables）。Options API 按 `data/methods/computed` 分块。复杂功能下 Composition 更易聚合与复用；Options 对新手更直观。本项目以 Composition + `script setup` 为主。

#### Q3. `script setup` 做了什么？有什么好处？

**答：**  
编译期语法糖：顶层绑定自动暴露给模板；组件自动注册；配合 `defineProps/defineEmits` 更简洁；运行时性能更好（更少代理层与样板代码）。坏处是对「动态组件名 / 少量需要显式 setup 返回」场景要额外注意。

#### Q4. `ref` 和 `reactive` 区别？怎么选？

**答：**  
`ref` 可包任意类型，访问用 `.value`；`reactive` 只能对象，属性直接访问。`ref` 整体替换方便；`reactive` 适合表单/状态对象。项目里 **ref 远多于 reactive**，组件实例引用几乎全是 ref。

#### Q5. 为什么 `ref` 在模板不用 `.value`，在 script 要用？

**答：**  
模板编译时会自动解包 ref。script 是普通 JS/TS，必须 `.value` 才能读写内部值。

#### Q6. 把 `ref` 赋值给变量或解构会怎样？

**答：**  
`const x = count`（count 是 ref）仍是同一个 ref，OK。  
`const { value } = count` 或从 reactive 对象直接解构属性会 **丢失响应式**。需要用 `toRefs` / `toRef`。

#### Q7. `computed` 和 `watch` 区别？

**答：**  
`computed` 有缓存，强调「由 A 算出 B」；`watch` 强调「A 变了要执行副作用」（请求、日志、同步外部）。能用 computed 就别用 watch 硬算。

#### Q8. `watch` 和 `watchEffect` 区别？

**答：**  
`watch` 需显式指定源，可获取 new/old，默认不立即执行（可 `immediate`）。  
`watchEffect` 自动收集依赖，默认立即执行，不方便拿旧值。本项目几乎只用 `watch`。

#### Q9. `shallowRef` / `shallowReactive` / `markRaw` 了解吗？

**答：**  
浅层响应：只代理第一层，用于大对象/第三方实例性能优化。`markRaw` 标记永不成为响应式（如 ECharts 实例、复杂类实例）。后台图表/地图场景可能用到。

#### Q10. Vue3 生命周期有哪些？`setup` 对应哪段？

**答：**  
`setup` 替代 `beforeCreate/created` 的同步逻辑；其余 `onMounted/onUpdated/onUnmounted...`。组件卸载要清定时器、WS、事件监听。

---



### B. 组件与工程题



#### Q11. 父子组件如何通信？

**答：**  
props / emits 为主；父调子用 `ref + defineExpose`；跨层可用 provide/inject；跨页面用 Pinia 或事件总线。本项目抽屉常用 expose。

#### Q12. `v-model` 在 Vue3 有何变化？

**答：**  
默认仍是 `modelValue` + `update:modelValue`；支持多个 v-model（`v-model:title`）；可用 `defineModel`（本项目尚未普及）。

#### Q13. 什么是 composable？如何设计一个好的 `useXxx`？

**答：**  
复用有状态逻辑的函数。好的 composable：单一职责、入参清晰、返回最小必要 API、内部处理好清理、不偷偷依赖太多隐式全局。本项目 `useTable`、`usePermission`、页面 `useXxx` 都是例子。

#### Q14. 你们列表页怎么写？

**答（按本项目）：**  
`Index.vue` + `useXxx.tsx` + `BaseTable`。`useXxx` 提供 `columns`、`getTableList`、`dataCallback`；表格负责分页/搜索 UI；页面负责权限按钮与抽屉编排。

#### Q15. 为什么列配置用 TSX？

**答：**  
列里有自定义渲染（标签、按钮、拼接字段），TSX `render` 比纯配置或大量 scoped slot 更集中，尤其复杂列展示时可读性更好。

#### Q16. Pinia 和 Vuex 区别？为什么用 Pinia？

**答：**  
无 mutation、TS 好、模块扁平、API 更贴近 Composition。本项目 store 带统一前缀并支持持久化。

#### Q17. 如何避免响应式丢失？

**答：**  

1. 不要对 ref/reactive 错误解构；2) 用 `reactive` 时避免整体替换丢代理；3) 异步回调里改的是 `.value` 或对象属性；4) 第三方大对象考虑 `shallowRef/markRaw`。



#### Q18. `nextTick` 解决什么问题？

**答：**  
Vue 更新 DOM 是异步批处理的。改完状态立刻读 DOM/调子组件方法可能拿到旧状态，需 `nextTick`。本项目表格、弹窗、图表场景很常见。

---



### C. 原理 / 进阶题



#### Q19. Proxy 相比 `defineProperty` 的优势？

**答：**  
可拦截新增/删除属性；数组下标与 `length` 更完整；不必递归一次性劫持所有属性（可懒代理）。限制是不兼容极老浏览器、对 Map/Set 等需额外处理（Vue3 已支持部分集合类型）。

#### Q20. 简述依赖收集与触发更新？

**答：**  
读响应式数据时（track）收集当前 effect；写时（trigger）通知相关 effect 重新运行。`computed` 是可缓存的 effect；组件渲染也是 effect。

#### Q21. `ref` 为什么对对象也可用？内部是什么？

**答：**  
`ref` 对对象值会内部再用 `reactive` 包装（通常情况）。访问统一走 `.value`，让基本类型与对象有一致心智。

#### Q22. 组件更新是同步还是异步？

**答：**  
状态修改同步发生，DOM 更新默认异步批量。同一事件循环多次改状态会合并，因此需要 `nextTick` 读更新后 DOM。

#### Q23. `key` 的作用？列表为什么不能用随机 key / index 乱用？

**答：**  
`key` 帮助 diff 复用正确节点。随机 key 会导致无法复用、状态错乱、性能差；`index` 在有插入/删除/排序时可能错绑输入框状态。

#### Q24. 如何优化大型列表页性能？

**答：**  
分页（本项目主流）、列按需显示、避免深层巨大 `reactive`、图表实例销毁、`v-show`/`v-if` 合理选择、防抖搜索、虚拟滚动（超大列表）、减少不必要 watch、合理拆组件。

#### Q25. `v-if` 和 `v-show` 区别？

**答：**  
`v-if` 条件为假时不渲染（销毁/重建，切换贵）；`v-show` 仅切 CSS `display`（初始都渲染，切换便宜）。本项目表格区域切换、低频条件块常用 `v-if`。

---



### D. 场景题（结合本仓库）



#### Q26. 打开编辑抽屉，你会怎么实现？

**答：**  
子抽屉 `defineExpose({ acceptParams })`；父 `ref` 拿到实例后调用并传入 `title/rowData/api`；提交成功后 `tableRef.getTableList()` 刷新。这是本仓库标准模式。

#### Q27. 站点树点击后表格要刷新，怎么做？

**答：**  
树 `@node-click` 改 `activeStation`（ref/reactive）；`watch(activeStation, ...)` 或直接在 handler 里改 `initParam` 并调用 `tableRef.value?.getTableList()` / 重置页码。

#### Q28. 不同地区字段显示不同（阿克苏/和田）怎么做？

**答：**  
读 `globalStore.systemEnv` / 数据字典，得到 `isAkesu/isHetian`，在 `columns` 上用 `isShow` 控制，或模板 `v-if`。属于运行时配置差异，不是多仓库硬分叉。

#### Q29. 权限按钮怎么控？

**答：**  
`usePermission()` 得到 `permission` 映射，模板 `v-if="permission.Xxx_yyy"`。权限码来自后端权限列表，前端不做唯一安全边界，但负责 UI 显隐。

#### Q30. 如果让你评价本项目 Vue3 使用，优缺点？

**答（示例）：**  
优点：Composition + setup 统一；列表页 `useXxx` 模式清晰；Base 组件沉淀充分；TS 覆盖较好。  
可改进：少数 Options 残留；`defineModel` 未用；部分页面 `useXxx` 过大可再拆；`watchEffect`/provide 使用少说明风格偏显式，但超大文件可读性仍需治理。

---



## 12. 10 分钟速记版（面试前刷）

1. 本项目 Vue3 主力：**Composition API +** `script setup lang="ts"`
2. 响应式主力：`ref` **>>** `reactive`；派生用 `computed`；副作用用 `watch`
3. 复用主力：`hooks/useXxx` **+ 页面** `useXxx.tsx`
4. 列表标准：`BaseTable` **+ columns/getTableList/dataCallback**
5. 弹窗标准：**父 ref + 子** `defineExpose(acceptParams)`
6. 全局状态：**Pinia**（非 Vuex）
7. DOM 后操作：`nextTick`
8. 原理关键词：**Proxy、依赖收集 track、触发 trigger、批量异步更新**
9. 别丢响应式：**错误解构 / reactive 整体替换**
10. 能讲清一个真实页面链路，比背概念更重要

---



## 13. 推荐对照阅读（仓库内）

- 页面编排：`src/views/EquipmentManage/TeamsManagement/Index.vue`
- 列表逻辑：`src/views/EquipmentManage/TeamsManagement/useTeamsManageQuery.tsx`
- 表格封装：`src/hooks/useTable.ts`
- 复杂页面：`src/views/AssistMonitor/OnlineMonitor/EnvironmentMonitor/Index.vue`
- 全局状态：`src/stores/modules/global.ts`
- 项目约定：根目录 `AGENTS.md`

---



## 14. 自测清单（复习用）

- [ ] 能手写一个 `script setup` 组件（props/emits/ref）
- [ ] 能说清 `ref` vs `reactive` 及项目选择倾向
- [ ] 能画出「Index.vue ↔ useXxx ↔ BaseTable ↔ API」数据流
- [ ] 能解释父如何调用子抽屉方法
- [ ] 能对比 `computed` / `watch` / `watchEffect`
- [ ] 能说明 Pinia 比 Vuex 简单在哪
- [ ] 能讲 Proxy 依赖收集的基本过程
- [ ] 能指出 `nextTick` 的一个真实业务场景
- [ ] 能说明权限与地区字典如何影响列展示
- [ ] 能用 1 分钟介绍本项目 Vue3 技术选型与代码组织

---

*文档用途：日常复习、面试口述提纲、新人 onboarding。若仓库统计变化，以第 1 章「抓比例」为准，不必拘泥绝对数字。*