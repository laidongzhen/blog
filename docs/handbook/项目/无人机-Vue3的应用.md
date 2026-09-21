---
title: Vue 3 在本项目中的应用
---

# Vue 3 在本项目中的应用

> 复习用：先记住项目怎么写。面试用：后半部分每道题都有答案。  
> 统计口径：`src` 下约 184 个 `.vue`，几乎全部是 `script setup lang="ts"`。Options API 页面级写法基本没有。

## 1. 先记住这句

> 页面只负责摆积木；状态、请求、权限，全部塞进 `useXxx` 这个工具箱。

把本仓库的 Vue 3 想成**装配车间**：

- `.vue` 是装配台：模板里摆 `ArtTablePage`、弹窗、卡片。
- `useXxx` 是工具箱：`ref` / `computed` / `watch` / 请求 / 权限都在这里。
- Pinia 是仓库总账：登录态、菜单、页签缓存，跨页面才放进去。
- `ArtTablePage` 是现成流水线：内部已经接好 `useTable`，业务页不要再平行造一套表格。

Vue 3 在这里**不是**展示站那套 Teleport 动画、Suspense 瀑布流。它被用成中后台默认底座：**Composition API + composable + 编译宏**。

## 2. 什么时候会碰到

- 新开列表页、弹窗、详情卡
- 搜索条件变了要重新拉数
- 父组件要开关子弹窗（`v-model`）
- 页签切走再回来，表格还在不在（`KeepAlive`）
- 按钮按权限显隐（`useAuth` + `computed`）
- 面试被问：你们项目 Vue 3 到底怎么用的

## 3. 一条链路看懂

以「打开角色列表」为例，全程都是 Vue 3 Composition API，没有 Options API：

1. 路由把 `src/views/system/role/index.vue` 挂到 `RouterView`。
2. 页面 `script setup` 里只调用 `useRoleManage()`，把返回值拆到模板。
3. `useRoleManage` 用 `ref` 管搜索表单和弹窗开关，用 `computed` 拼 `tablePageProps`。
4. 模板把 `tablePageProps` 绑到 `ArtTablePage`。
5. `ArtTablePage` 内部调用 `useTable`，真正发请求、管分页、管 loading。
6. 点「新增」打开 `RoleEditDialog`：`defineProps` + `defineEmits` 做双向绑定；`watch` 在弹窗打开时灌表单。
7. 保存成功后，父页通过 `defineExpose` 出来的 `refreshData` 刷新表格。

```text
index.vue（薄页面）
  └─ useRoleManage()          ← composable：状态 + 配置
        └─ ArtTablePage
              └─ useTable()   ← 公共 hook：请求 + 分页
        └─ RoleEditDialog
              └─ props / emit / watch
```

## 4. 业务页怎么写

推荐：页面只编排，逻辑进 composable。

```1:45:src/views/system/role/index.vue
<template>
  <div class="art-full-height">
    <ArtTablePage
      ref="tablePageRef"
      v-model:search-form="searchForm"
      v-model:show-search-bar="showSearchBar"
      v-bind="tablePageProps"
    />
    <!-- 弹窗 -->
  </div>
</template>

<script setup lang="ts">
  import { useRoleManage } from './useRole'

  defineOptions({ name: 'Role' })

  const {
    tablePageProps,
    searchForm,
    showSearchBar,
    tablePageRef,
    dialogVisible,
    permissionDialog,
    currentRoleData,
    stationOptions,
    handleRoleSubmit,
    refreshTable
  } = useRoleManage()
</script>
```

**不要这样**：在 `index.vue` 里堆 300 行 `ref`、请求、列配置、弹窗提交。本仓库约定页面是编排层，逻辑在 `useXxx`。也不要在页面里直接 `axios`，更不要平行再写一套表格 hook。

| 想改什么 | 先打开哪个文件 |
|----------|----------------|
| 列表请求、列、新增按钮 | 对应页的 `useXxx.ts` / `useXxx.tsx` |
| 搜索栏 / 分页 / loading | `ArtTablePage` → 内部 `useTable` |
| 弹窗字段和校验 | `views/**/modules/*-dialog.vue` |
| 按钮权限 | `src/hooks/core/useAuth.ts` |
| 页签缓存 | `art-page-content` + `defineOptions({ name })` |
| `ref` 不用手写 import | `vite.config.ts` 的 `unplugin-auto-import` |

## 5. 只要记住这几个点

### 5.1 几乎所有组件都是 `script setup lang="ts"`

**类比**：车间统一用同一种扳手，不再混用老式螺丝刀（Options API）。

**代码里**：`script setup` 里的顶层变量自动暴露给模板。`defineOptions` 补组件名，给 `KeepAlive` 用。`ref` / `computed` / `onMounted` 常常不用手写 import，靠自动导入。

```25:32:src/views/system/role/index.vue
<script setup lang="ts">
  import ArtTablePage from '@/components/core/tables/art-table-page/index.vue'
  import { useRoleManage } from './useRole'

  defineOptions({ name: 'Role' })
```

**合上书记住**：新页面默认 `script setup + TS`，不要写 `export default { data() {} }`。

**别这样**：为了「看起来更完整」再包一层 `defineComponent` + `setup()`。本仓库页面级几乎不用。

### 5.2 源状态用 `ref`，派生用 `computed`，副作用才 `watch`

**类比**：原料放货架（`ref`），价签由原料算出来（`computed`），原料变了才派人去进货（`watch`）。

**代码里**：角色页搜索表单是 `ref`；有没有筛选条件、表格 props 是 `computed`；可靠性指标页「变电站变了 → 重新拉机场下拉」才是 `watch`。

```68:85:src/views/system/role/useRole.tsx
export function useRoleManage() {
  const searchForm = ref<RoleSearchForm>({ ...DEFAULT_SEARCH_FORM })
  const showSearchBar = ref(true)
  const tablePageRef = ref<TablePageExpose | null>(null)
  const { hasAuth } = useAuth()

  const hasSearchCondition = computed(
    () =>
      !!searchForm.value.roleInfo ||
      !!searchForm.value.stationCode ||
      searchForm.value.enableTag !== ''
  )
```

```245:252:src/views/monitor/reliability-indicator/useReliabilityIndicator.ts
  watch(
    () => searchForm.value.stationCode,
    async (stationCode, previousCode) => {
      if (initializing.value || stationCode === previousCode) return
      await loadDockOptions(stationCode)
      searchForm.value.dockSn = dockOptions.value[0]?.value ?? ''
    }
  )
```

弹窗打开灌表单也是副作用，所以走 `watch`，不是 `computed`：

```145:152:src/views/system/role/modules/role-edit-dialog.vue
  watch(
    () => [dialogVisible.value, props.roleData],
    ([visibleNow]) => {
      if (!visibleNow) return
      initForm()
    },
    { immediate: true }
  )
```

`reactive` 有，但少。角色弹窗的表单对象用了 `reactive`，因为一整份表单字段要一起改：

```57:62:src/views/system/role/modules/role-edit-dialog.vue
  const form = reactive<RoleFormData>({
    name: '',
    stationCodes: [],
    remark: '',
    enableTag: 1
  })
```

**合上书记住**：能算出来的不要另存一份；要调接口、改别人的状态，才用 `watch`。

**别这样**：用 `watch` 把 `a` 抄到 `b`，再在模板里用 `b`。那就是手动维护的 `computed`，容易漏更新。

### 5.3 子组件合同是 props 向下、事件向上；双向绑定要显式

**类比**：上级把材料递下来，下级做完喊一声「改好了」，不要悄悄改上级口袋里的东西。

**代码里**：角色弹窗用 TypeScript 接口描述 `Props` / `Emits`，`v-model` 拆成 `modelValue` + `update:modelValue`。公共搜索栏更进一步，用 `defineModel`。

```31:50:src/views/system/role/modules/role-edit-dialog.vue
  interface Props {
    modelValue?: boolean
    visible?: boolean
    roleData?: Role.IResRoleDto
    stationOptions?: Array<Record<string, unknown>>
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'update:visible', value: boolean): void
    (e: 'submit', data: RoleFormData): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: undefined,
    visible: undefined,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()
```

```131:132:src/components/core/forms/art-search-bar/index.vue
  const modelValue = defineModel<Record<string, any>>()
  const formModel = computed<Record<string, any>>(() => modelValue.value ?? {})
```

父页用法：`v-model="dialogVisible"`、`@submit="handleRoleSubmit"`。这就是 Vue 3 的 `v-model` 默认约定。

**合上书记住**：业务弹窗多用 `defineProps` + `defineEmits`；基础表单组件才用 `defineModel`。

**别这样**：子组件直接改 `props.xxx = ...`。Vue 会警告，数据流也会乱。

### 5.4 逻辑复用靠 composable，不靠 mixin

**类比**：工具箱可以借给任何工位；mixin 像把别人的抽屉整柜塞进你工位，名字一撞就乱。

**代码里**：公共能力在 `src/hooks/core/`（`useTable`、`useAuth`、`useChart`、`useSystemSocket`）。页面私有逻辑放在页面旁边的 `useRole.tsx`、`useReliabilityIndicator.ts`。`useAuth` 内部用 `computed` 派生超管身份，用普通函数做权限判断：

```34:57:src/hooks/core/useAuth.ts
export const useAuth = () => {
  const userStore = useUserStore()
  const { authButtonCodes, roles } = storeToRefs(userStore)

  const isSuperAdmin = computed(() =>
    (roles.value ?? []).some((item) => item?.roleTypeCode === SUPER_ADMIN_ROLE_TYPE_CODE)
  )

  const hasAuth = (auth: string): boolean => {
    const authCode = String(auth ?? '').trim()
    if (!authCode) return false
    if (isSuperAdmin.value) return true
    return authButtonCodes.value.includes(authCode)
  }

  return { hasAuth }
}
```

列表数据管理被 `ArtTablePage` 吃掉了，业务页一般**不直接**调 `useTable`：

```164:176:src/components/core/tables/art-table-page/index.vue
  const internalTable = useTable({
    core: {
      apiFn: requestConfig.apiFn as (params: Record<string, unknown>) => Promise<any>,
      apiParams: {
        ...requestInitialSearchParams,
        ...(requestConfig.apiParams ?? {})
      },
      excludeParams: requestConfig.excludeParams ?? [],
      immediate: requestConfig.immediate ?? true,
      columnsFactory: requestConfig.columnsFactory,
      paginationKey: requestConfig.paginationKey
    }
  })
```

父页刷新表格，靠子组件 `defineExpose`：

```371:378:src/components/core/tables/art-table-page/index.vue
  defineExpose({
    tableRef,
    scrollToTop: () => tableRef.value?.scrollToTop?.(),
    getTableInstance: () => tableRef.value?.getTableInstance?.(),
    refreshData: () => internalTable.refreshData(),
    search: (params?: Record<string, unknown>) =>
      handleSearch(params ?? (searchForm.value as Record<string, unknown>)),
```

**合上书记住**：能复用的进 `src/hooks/core`；只服务当前页的放 `views/**/useXxx`。列表优先 `ArtTablePage`，不要再包一层 `useTable`。

**别这样**：把用户 token、菜单塞进页面自己的 `ref`。跨页状态走 Pinia。

### 5.5 跨页状态用 Pinia Setup Store；页签缓存靠名字 + KeepAlive

**类比**：车间总账本只有一本（Pinia）；工位上的临时便签（页面 `ref`）下班可以扔。页签要「离开还留着」，必须给工位挂工牌（组件 `name`）。

**代码里**：Store 是 `defineStore('id', () => { ... })`，和 composable 长得像。`storeToRefs` 保持响应式。用户 store 还开了持久化。

```53:79:src/store/modules/user.ts
export const useUserStore = defineStore(
  'userStore',
  () => {
    const language = ref(LanguageEnum.ZH)
    const isLogin = ref(false)
    const accessToken = ref('')
    const roles = ref<Auth.UserAuthInfo['roles']>([])
    const authButtons = ref<Auth.UserAuthInfo['buttons']>([])
    const authButtonCodes = computed(() =>
      (authButtons.value ?? []).map((item) => String(item?.code ?? '').trim()).filter(Boolean)
    )
```

布局里：路由 `meta.keepAlive` 为真才包 `KeepAlive`；关掉的页签名字进 `keepAliveExclude`。

```17:31:src/components/core/layouts/art-page-content/index.vue
    <RouterView v-if="isRefresh" v-slot="{ Component, route }" :style="contentStyle">
      <Transition v-if="route.meta.keepAlive" ...>
        <KeepAlive :max="10" :exclude="keepAliveExclude">
          <component class="art-page-view" :is="Component" :key="route.path" />
        </KeepAlive>
      </Transition>
      <Transition v-else ...>
        <component class="art-page-view" :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
```

`Teleport` 在本仓库几乎只做全屏过渡遮罩，不是弹窗主方案（弹窗走 Element Plus Dialog）。

**合上书记住**：页面要写 `defineOptions({ name: 'Xxx' })`，名字和路由组件名对得上，缓存才生效。

**别这样**：页面不写 `name`，却指望切走再回来表格还在。`script setup` 默认没有 Options API 那种 `name` 字段。

## 6. 别踩这些坑

- `script setup` 的绑定默认是私有的。父组件 `ref` 拿不到子组件方法，除非 `defineExpose`。`ArtTablePage` 就是这么把 `refreshData` 交出去的。
- 自动导入不等于「Vue 不用声明」。`.ts` / `.tsx` composable 里有人会显式 `import { ref, computed, watch } from 'vue'`（如 `useReliabilityIndicator.ts`），有人完全靠自动导入（如 `useAuth.ts` 里的 `computed`）。两边都能跑；面试时要说得清：这是构建期注入，不是运行时魔法。
- `useAuth` 里的 `computed` 没写 import，靠 `unplugin-auto-import` 扫 `vue` / `pinia` / `vue-router` / `@vueuse/core`。配置在 `vite.config.ts`。
- 业务弹窗大量手写 `modelValue` + `update:modelValue`，基础组件才 `defineModel`。不要在面试里说「项目全面 defineModel」。
- `provide/inject` 基本不用。地图实例是少数例外（`useMapInstance.ts`）。权限、用户、菜单走 Pinia，不走注入。
- JSX 在本仓库是合法的（Vite 配了 `vueJsx`，`esbuild.jsxFactory = 'h'`）。角色页表头「新增角色」就是 `headerLeftRender` 返回 JSX，不是模板。

## 7. 高频面试题（都带答案）

下面分四组：**原理**、**响应式**、**组件通信**、**结合本项目**。先答结论，再补一句和仓库的对应关系。

---

### A. 原理与写法

**Q1. Vue 3 相对 Vue 2，面试里最该说的三件事是什么？**

答：

1. 重写响应式：`Object.defineProperty` → `Proxy`，能监听新增属性、删除属性、数组索引。
2. 新增 Composition API：逻辑按功能聚合，而不是按 `data/methods/computed` 切片。
3. 编译和运行时拆包，配合 `script setup`、Tree-shaking，打包更小。

本仓库把第 2 点用到了极致：页面和 hook 全是组合式，看不到 Options API 页面。

**Q2. Composition API 和 Options API 怎么选？你们为什么全用组合式？**

答：Options API 对入门友好，选项分类清晰。组合式适合：逻辑复用、TypeScript、大页面拆 composable。

本仓库是中后台，一个列表页同时有搜索、分页、权限、弹窗、导出。Options API 会把同一件事拆到 `data`、`methods`、`watch` 三处。抽成 `useRoleManage` 后，打开一个文件就能看完角色页。

**Q3. `script setup` 和普通 `setup()` 有什么区别？**

答：

| | `setup()` | `script setup` |
|--|-----------|------------------|
| 暴露给模板 | 必须 `return { ... }` | 顶层变量自动暴露 |
| props/emits | `setup(props, { emit })` | `defineProps` / `defineEmits` 编译宏 |
| 组件名 | `defineComponent({ name })` | `defineOptions({ name })` |
| 性能 | 每次创建调用 setup | 编译成普通 setup，少一层样板 |

本仓库选 `script setup`：样板少、类型好写、和自动导入配合。

**Q4. `defineProps`、`defineEmits`、`defineModel`、`defineExpose`、`defineOptions` 为什么不用从 `vue` import？**

答：它们是**编译器宏**。`script setup` 编译时被转换成真正的 `props`/`emits` 选项，源码里像函数，运行时并不存在这些 import。面试官如果追问「能不能在普通 `.ts` 里用 `defineProps`」：不能，只属于 SFC 的 script setup。

**Q5. Vue 3 响应式原理（Proxy）怎么用一分钟讲完？**

答：

1. `reactive`/`ref` 把对象包进 `Proxy`。
2. `get` 时收集依赖（当前 effect / 组件渲染函数）。
3. `set` 时触发依赖重新执行。
4. `computed` 是带缓存的 effect；`watch` 是独立 effect，回调里做副作用。

Vue 2 的 `defineProperty` 要预先递归属性，新加字段要用 `Vue.set`。Proxy 代理整个对象，`obj.newKey = 1` 也能触发更新。

**Q6. `ref` 和 `reactive` 怎么选？**

答：

- `ref`：任意类型（原始值、对象）。取值 `.value`。模板里自动解包。
- `reactive`：只能是对象。没有 `.value`，但替换整个对象会丢代理。解构会丢响应式，要用 `toRefs`。

本仓库更爱 `ref`：搜索表单、弹窗开关、loading、列表数据都是 `ref`。`reactive` 出现在「一整份表单对象就地改字段」的场景（角色弹窗 `form`）。面试可以补一句：团队规范优先 `ref`，心智更统一。

**Q7. 模板里为什么不用写 `searchForm.value`？**

答：模板编译时会对 `ref` 自动解包。`script` 里必须 `.value`。注意：嵌套在响应式对象里的 `ref` 也会解包；但放到普通数组/Map 里不会。`reactive({ count: ref(0) }).count` 已经是数字。

**Q8. `computed` 和 `watch` 的本质区别？**

答：

- `computed`：派生**值**，有缓存，只有依赖变了才重算。模板用它做展示、拼 props。
- `watch`：做**副作用**（请求、改别的状态、操作 DOM、打开弹窗灌数据）。默认懒执行，可 `immediate`、`deep`。

口诀：能算出来用 `computed`；要办事用 `watch`。

本仓库对照：

- `computed`：`hasSearchCondition`、`tablePageProps`、`metricCards`、`isSuperAdmin`、`authButtonCodes`
- `watch`：变电站变化拉机场列表；弹窗打开 `initForm`；`ArtTablePage` 同步外部 `searchForm`

**Q9. `watch` 和 `watchEffect` 呢？**

答：`watchEffect` 立即跑，自动收集回调里用到的响应式依赖，写起来短，但依赖不直观，也难拿到 oldValue。`watch` 显式声明数据源，能拿新旧值，能控制 `flush`/`deep`。本仓库业务代码以显式 `watch` 为主，更好审。

**Q10. `shallowRef` / `shallowReactive` 什么时候用？**

答：只监听 `.value` 替换（或根级属性），不深代理内部。适合巨大不可变数据、第三方实例（编辑器、地图、播放器）。本仓库 `art-page-content` 用 `shallowRef(true)` 做刷新开关；富文本里编辑器实例用 `shallowRef`。大表格行数据若内部字段不需要逐层变成响应式，也可以考虑浅层，但本仓库列表数据主要还是普通 `ref`。

**Q11. `nextTick` 干什么？**

答：DOM 更新是异步批量的。改完 `ref` 立刻量高度、滚到底、`focus` 输入框，可能拿到旧 DOM。`nextTick` 等本轮渲染结束。`useTable` 的 import 列表里就有它，用于布局/分页后的 DOM 对齐。

**Q12. Composition API 生命周期怎么记？和 Options API 对照。**

答：没有 `beforeCreate`/`created`。`setup` / `script setup` 同步代码 ≈ created。其余加 `on` 前缀：

| Options | Composition |
|---------|-------------|
| beforeMount | `onBeforeMount` |
| mounted | `onMounted` |
| beforeUpdate | `onBeforeUpdate` |
| updated | `onUpdated` |
| beforeUnmount | `onBeforeUnmount` |
| unmounted | `onUnmounted` |

`App.vue`：`onBeforeMount` 开主题，`onMounted` 做存储兼容检查。角色 composable：`onMounted` 拉站点下拉。可靠性指标：`onMounted` 拉变电站并拉总览。

KeepAlive 额外有 `onActivated` / `onDeactivated`。页面被缓存后，再次进入不会重新 `onMounted`。

**Q13. 为什么 `script setup` 里还要 `defineOptions({ name })`？**

答：KeepAlive 按**组件 name** 缓存/排除。`script setup` 不会从文件名自动生成 Options 的 `name`（除非另开插件）。本仓库页签关闭时把 name 推进 `keepAliveExclude`。页面不写 name，缓存和「关掉这个页签不要再缓存」都会对不上。

**Q14. KeepAlive 原理？本项目怎么接路由？**

答：KeepAlive 把动态组件的 VNode / 实例存一份，切走时不销毁，切回时走 `activated` 而不是重新 `mounted`。本项目：

1. 路由 `meta.keepAlive` 决定要不要包 KeepAlive。
2. `max=10` 限制缓存数量。
3. `exclude` 绑定 `worktab` store 的 `keepAliveExclude`，关页签时排除。
4. `:key="route.path"` 避免不同路径复用同一实例。

**Q15. Teleport、Suspense 本项目用了吗？**

答：`Teleport` 有，布局里把过渡遮罩挂到 `body`，避免被 overflow 裁切。弹窗本身用 Element Plus，不手写 Teleport。`Suspense` 不是业务主路径。面试不要吹「我们大量 Teleport/Suspense」。

---

### B. 组件通信与复用

**Q16. Vue 3 组件通信有哪些？你们项目实际用哪些？**

答：常见清单：

1. props / emits（主路径）
2. `v-model` / `defineModel`
3. 插槽（`ArtTablePage` 的 `header-left`、`search`）
4. `defineExpose` + 父 `ref`
5. provide/inject（几乎不用）
6. Pinia（跨页、跨布局）
7. 事件总线（本仓库不作为主方案）

实际主路径：**props/emits + v-model + slot + expose + Pinia**。

**Q17. Vue 3 的 `v-model` 和 Vue 2 有什么不同？**

答：Vue 2 默认 `value` + `input`。Vue 3 默认 `modelValue` + `update:modelValue`。可以多个：`v-model:search-form`、`v-model:show-search-bar`，对应 `searchForm` / `update:searchForm`。`defineModel('columns')` 是宏糖，编译后仍是这对 props/emits。

角色弹窗同时 emit `update:modelValue` 和 `update:visible`，兼容两种绑定写法。

**Q18. 为什么不能直接改 props？**

答：单向数据流。父是源，子是只读视图。子要改，必须 emit，由父改源。直接改 props：开发环境警告、和父的下次渲染打架、难以追踪。本仓库弹窗关窗走 `emit('update:modelValue', false)`。

**Q19. `defineExpose` 解决什么问题？**

答：`script setup` 默认不把内部方法挂到实例上，避免父组件乱调子组件实现。需要对外的 API（刷新表格、校验表单、拿播放器实例）再 `defineExpose`。这是有意为之的封装边界。

面试加分：父组件应少用 ref 调子方法；能用 props/emits 解决的不要 expose。表格刷新是少数合理场景。

**Q20. 插槽和作用域插槽？**

答：普通插槽：父决定一块 UI 长什么样（表头左侧按钮）。作用域插槽：子把数据回传给父来渲染（`RouterView v-slot="{ Component, route }"`）。`ArtTablePage` 提供 `before-search`、`search`、`header-left`、`header-right` 等，默认用自己的 `ArtSearchBar`，父也可以整段替换。

**Q21. provide/inject 的坑？为什么权限不用它？**

答：跨多层方便，但依赖是隐式的，类型要靠 `InjectionKey`，调试难。响应式要传 `ref`/`computed` 或 `readonly`。本仓库权限、用户、菜单是全局的，Pinia 更合适：可持久化、DevTools、不绑组件树。provide/inject 留给「这棵子树才有的实例」，例如地图。

**Q22. mixin 有什么问题？composable 怎么替代？**

答：mixin：数据来源不清、属性名冲突、类型糟糕、逻辑和来源脱节。composable：就是一个函数，入参出参清楚，可以嵌套调用（`useRoleManage` 调 `useAuth`），TS 友好。Vue 3 官方推荐用 composable 替代 mixin。

**Q23. composable 有什么规则？**

答：

1. 命名 `useXxx`。
2. 必须在 `setup` 同步上下文调用（才能绑上当前组件的生命周期和 effect 作用域）。异步回调里再调 `useXxx` 会丢失当前实例。
3. 返回响应式对象，不要在 composable 里偷偷改全局。
4. 副作用要配对清理（`onUnmounted` 里关 Socket、清定时器）。`useTable` 就 import 了 `onUnmounted`。

**Q24. Pinia 和 Vuex 的区别？Setup Store 是什么？**

答：Pinia：无 mutations、TS 好、模块是独立 `defineStore`、体积小。Vuex 4 也能用在 Vue 3，但新项目基本 Pinia。

Setup Store：`defineStore('id', () => { const x = ref(); const y = computed(); function act(){}; return { x, y, act } })`。和 composable 同构。本仓库 `useUserStore` 就是这种。Option Store 是 `{ state, getters, actions }`，本仓库不是主流。

**Q25. 为什么解构 store 要用 `storeToRefs`？**

答：直接 `const { language } = useUserStore()` 会丢掉响应式（和从 `reactive` 解构一样）。`storeToRefs` 把 state/getters 转成 `ref`，actions 仍从 store 上拿方法。`App.vue`、`useAuth` 都是这个写法。

**Q26. 自动导入是怎么工作的？会不会让人看不懂代码？**

答：`unplugin-auto-import` 在 Vite 编译时扫描源码，发现 `ref`/`computed`/`useRoute` 等未导入标识符，就注入 import，并生成 `src/types/import/auto-imports.d.ts` 给 TS。配置：

```98:107:vite.config.ts
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/import/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
```

面试可以说：约定俗成的 Vue API 自动导入；业务模块（`@/api`、页面 composable）仍然显式 import，避免全局污染。

---

### C. 容易追问的细节

**Q27. `computed` 能写 setter 吗？**

答：能。`computed({ get() {}, set(v) {} })`。本仓库双向绑定更常见的是 `v-model` / `defineModel`，而不是可写 computed。面试知道即可。

**Q28. `watch` 的 `deep`、`flush`、`once`？**

答：`deep` 监听对象内部变化，代价是遍历。`ArtTablePage` 同步外部 `searchForm` 用了 `{ immediate: true, deep: true }`，因为搜索对象字段会就地改。`flush: 'post'` 等 DOM 更新后；`'sync'` 同步触发（少用）。Vue 3.4+ 有 `once`。

**Q29. 响应式丢失的典型场景？**

答：

1. 从 `reactive` 解构没 `toRefs`。
2. 用普通变量接 `ref.value` 再改这个普通变量。
3. 对 `reactive` 整体换对象（`state = {}`）而不是改属性或换 `ref`。
4. 把响应式对象 `JSON.parse(JSON.stringify())` 之后当源数据用。
5. 在 `reactive` 里放不可代理的东西（浏览器原生对象、某些 class）。

**Q30. `v-if` 和 `v-show`？列表 `key`？**

答：`v-if` 真销毁/创建，适合低频切换、带重逻辑的分支（本仓库 KeepAlive 内外两套 `Transition` 就是 `v-if="route.meta.keepAlive"`）。`v-show` 只切 CSS，适合频繁切换。列表 `key` 必须稳定唯一，不要用 index（排序/删除会复用错状态）。表格 `rowKey: 'id'` 就是这个道理。

**Q31. 虚拟 DOM / diff 还要讲多深？**

答：面试够用的版本：模板 → 渲染函数 → VNode 树 → patch。Vue 3 编译期静态提升、PatchFlag，运行时只更新动态节点。中后台很少手写渲染函数；例外是搜索栏/表头用 `h()` 或 JSX 拼按钮。

**Q32. 自定义指令了解吗？**

答：本仓库有权限指令（`directives`），用来按权限拆 DOM。和 `useAuth().hasAuth` 是两条路：指令偏模板声明，composable 偏脚本判断（列按钮、JSX 表头）。面试被问指令钩子：Vue 3 是 `created/mounted/updated/unmounted` 等，和 Vue 2 的 `bind/inserted` 不同。

---

### D. 结合本项目的追问（很加分）

**Q33. 用你们仓库讲一遍 Vue 3 是怎么落地的。**

答（背这段即可）：

> 我们后台项目把 Vue 3 用成三层。第一层，所有 SFC 都是 `script setup lang="ts"`，不用 Options API。第二层，页面只编排，列表走 `ArtTablePage`，状态和请求进旁边的 `useXxx` composable，公共能力进 `src/hooks/core`，例如 `useTable`、`useAuth`。第三层，跨页状态用 Pinia Setup Store，页签缓存用 `KeepAlive` + `defineOptions({ name })`。`ref` 管源状态，`computed` 管派生，`watch` 管拉数和灌表单。组件之间 props 向下、emit 向上，父要调子方法才 `defineExpose`。

**Q34. 为什么业务页不直接 `useTable()`？**

答：`useTable` 已经封装请求、分页、缓存、列显示。但搜索栏、表头、空态、卡片布局每次还要拼一遍。`ArtTablePage` 把 UI 和 `useTable` 焊在一起，页面只传 `request.apiFn` 和 `searchItems`。直接调 `useTable` 会平行造第二套列表页，违反项目约定。

**Q35. `useRole.tsx` 为什么是 tsx 不是 ts？**

答：`headerLeftRender` 要返回 VNode（「新增角色」按钮）。用 JSX 比一长串 `h(ElButton, ...)` 可读。Vite 配了 Vue JSX 插件，工厂函数是 `h` 不是 `React.createElement`。这说明 Vue 3 不一定只有模板，编译到渲染函数即可。

**Q36. `useAuth` 里的 `computed` 没 import，能过 TypeScript 吗？**

答：能。`auto-imports.d.ts` 把 `computed` 声明成全局。这是生成文件，不要手改。CI / 新克隆项目要先跑过 Vite 生成它，否则 IDE 会报找不到名称。

**Q37. 打开弹窗灌表单，为什么用 `watch` 不用 `computed`？**

答：表单是用户可编辑的源状态（`reactive(form)`）。打开弹窗时要从 `roleData` **拷贝**进去，之后用户改的是这份拷贝，不是派生值。`computed` 做表单会和输入框打架（算出来的值不该被用户改，除非可写 computed 再写回源，本场景更绕）。所以：可见性变化 → `watch` → `Object.assign(form, ...)`。

**Q38. 父页 `v-model:search-form="searchForm"`，子组件内部改搜索表单，数据流合法吗？**

答：合法。这是约定好的双向绑定：子 emit `update:searchForm`（或 `defineModel`），父的 `searchForm` ref 才变。不是子偷偷改 props。`ArtTablePage` 还用 `watch(() => props.searchForm, ...)` 把外部受控值同步到内部 `localSearchForm`，避免受控/非受控打架。

**Q39. 如果面试官问「Vue 3 还有哪些你们没用上的？」怎么答？**

答：诚实列：业务几乎不用 Suspense、几乎不用 provide/inject、`defineModel` 只在基础表单组件、没有大面积 `defineAsyncComponent` 手写（路由懒加载是另一层）、没有用 Options API 混写。说明我们按中后台需求裁剪，而不是把官网特性清单用满。

**Q40. 现场手写：一个弹窗组件的 Vue 3 骨架。**

答（和本仓库角色弹窗同构）：

```ts
const props = defineProps<{ modelValue: boolean; roleData?: RoleDto }>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; submit: [Form] }>()
const form = reactive({ name: '' })
watch(
  () => [props.modelValue, props.roleData],
  ([visible]) => { if (visible) Object.assign(form, props.roleData ?? { name: '' }) }
)
const close = () => emit('update:modelValue', false)
```

模板：`v-model` 或 `:model-value` + `@update:model-value`。不要在子组件里改 `props.modelValue`。

---

## 8. 合上书自测

先自己答，再对第 7 节。

1. 新写一个「站点列表」页，`.vue` 里该放什么、不该放什么？`useTable` 写在哪一层？
2. 搜索条件、表格空文案、弹窗打开灌表单，分别该用 `ref` / `computed` / `watch` 的哪一个？为什么？
3. 页签关掉再打开，表格筛选还在。依赖 Vue 3 的哪几件事同时成立？（组件名、KeepAlive、store exclude、key）

---

## 附录：API 用量对照（便于口头说「我们用得最多的是」）

| Vue 3 能力 | 在本仓库 | 面试怎么说 |
|------------|----------|------------|
| `script setup lang="ts"` | 几乎全部 SFC | 默认底座 |
| `ref` | 源状态第一选择 | 用得最多的响应式 API |
| `computed` | 表格 props、权限、展示字段 | 第二多 |
| `defineProps` / `defineEmits` | 弹窗、卡片标配 | 组件合同 |
| composable / hooks | 页面 `useXxx` + `src/hooks/core` | 逻辑复用主模式 |
| `defineOptions({ name })` | 页面和核心组件 | 给 KeepAlive |
| `watch` | 联动拉数、灌表单、受控同步 | 副作用 |
| Pinia Setup Store | 用户 / 菜单 / 页签 | 跨页状态 |
| `defineExpose` | 表格、表单、播放器 | 有限的父调子 |
| `defineModel` | 搜索栏、表单、表头列 | 基础组件才用 |
| `KeepAlive` + `Transition` | 布局内容区 | 页签缓存 |
| `Teleport` | 过渡遮罩 | 偶尔 |
| `reactive` | 少量表单对象 | 不是首选 |
| provide/inject | 地图实例 | 几乎不用 |
| Options API | 业务页没有 | 明确不用 |
| Suspense | 非主路径 | 不要硬吹 |

**一句话收口**：本项目把 Vue 3 用成「`script setup` + composable + Pinia」，`ref`/`computed`/`props-emits` 是日常，KeepAlive 是布局能力，展示型高级特性很少。面试顺着角色列表这一条链路讲，比背 API 清单更像真做过。
