# Git Worktree 完整使用详解 \+ 项目实操手册（Windows开发版）（260820）

## 一、Git Worktree 核心详解（通用基础）

**git worktree**：**一个git仓库，多个工作目录**。一份 `.git` 仓库数据库，对应多个独立工作文件夹，每个文件夹可单独切换不同分支，所有工作区互不干扰。

**核心特性**：多个 worktree 共享同一个 git 对象库（`.git/objects`），仓库历史数据仅存储一份，仅工作区代码独立，极致节省磁盘空间。

### 1\.1 解决开发核心痛点

- 无需频繁切换分支：避免切分支前必须`stash/commit` 保存半成品代码，无需重复编译、安装依赖

- 无需重复克隆仓库：对比多分支代码、多版本调试，无需克隆多份仓库，避免磁盘冗余

- 应急开发无干扰：功能开发到一半，可快速新建工作区修复线上 bug，不中断原有开发进度

### 1\.2 基础核心概念

- **主工作树**：项目初始 clone 生成的文件夹，默认常驻工作区

- **附加工作树**：通过 `git worktree add` 命令创建的额外独立工作目录

- **强制规则**：每个 worktree 仅能绑定**唯一分支**，同一分支不可绑定多个工作区，Git 会强制拦截报错

### 1\.3 全局常用命令全集

```Plain Text
# 1. 创建指定分支的工作树
git worktree add 目录路径 分支名

# 2. 创建工作树 + 新建分支（基于当前分支）
git worktree add -b 新分支名 目录路径

# 3. 查看当前所有工作树列表
git worktree list

# 4. 正常删除工作树（推荐，完整清理文件+缓存）
git worktree remove 目录路径

# 5. 移动工作树目录位置
git worktree move 旧路径 新路径

# 6. 清理手动删除残留的脏数据记录
git worktree prune
```

### 1\.4 工作树目录结构原理

主工作树：拥有完整的 `.git` 仓库目录（含 objects、refs 等核心数据）。

附加工作树：**无完整 \.git 目录**，仅存在一个 `.git` 软链接文件，指向主仓库的 worktrees 缓存目录，所有分支、commit、版本数据均共享主仓库，仅工作区代码、配置、依赖独立。

### 1\.5 开发常用场景汇总

#### 场景1：半成品开发，紧急修复线上Bug（最高频）

当前分支功能未开发完成、代码未提交/暂存，无需任何操作，直接新建临时工作区拉取 bug 分支修复，原有代码完全保留。

#### 场景2：多功能分支并行开发

需同时开发两个独立功能分支，可创建两个工作树，分别对应不同功能分支，双窗口并行调试、运行项目，无需反复切分支。

#### 场景3：多分支代码对比、版本校验

同时打开主干分支、发布分支、开发分支工作区，本地直接对比代码差异、校验版本兼容问题，效率远超切换分支对比。

#### 场景4：临时查看历史Commit代码

可基于指定 commit 哈希创建临时工作树，游离 HEAD 状态，仅用于查看、验证历史代码，用完直接删除，不影响任何分支。

### 1\.6 Worktree 优缺点对比（vs Stash）

|操作方式|优点|缺点|
|---|---|---|
|git stash|无需新建目录，操作轻量化|需手动暂存/弹出，容易堆积记录，切换分支易冲突，中断开发连贯性|
|git worktree|代码无感知留存，真正并行开发，无需暂存提交，无冲突风险|需要创建独立目录，需简单管理工作树生命周期|

### 1\.7 通用避坑指南

1. 禁止在主仓库内部嵌套创建工作树，必须放置在仓库同级目录，避免被 Git 纳入版本管理

2. 禁止手动删除工作树文件夹，会残留 Git 缓存记录，必须使用 `git worktree remove`

3. 所有工作树共享远程分支数据，任意工作区执行 `git fetch/pull`，全局生效

4. 项目子模块、依赖（node\_modules）独立，每个工作区需单独安装，互不共享

5. 同一分支只能绑定一个工作区，重复创建直接报错，为 Git 原生保护机制

---

## 二、项目专属实操（mawan\-belt\-convey\-front \+ Windows）

### 2\.1 适用场景

本地项目正常开发中，代码写到一半（**未提交、未暂存**），需要紧急修复线上 Bug，不想中断当前开发进度、不想 stash 暂存代码、不想来回切换分支。

项目本地路径：`C:\work\mawan-belt-convey-front`

核心优势：原有开发代码完全保留，独立工作区专门修复 Bug，互不干扰。

### 2\.2 项目实操核心原理

- 一份 Git 仓库本体，多个独立工作目录

- 原项目目录：保留半成品代码，继续开发原有功能

- 新建 Worktree 目录：纯净分支环境，专门修复 Bug

### 2\.3 完整实操步骤

#### 1\. 进入主项目目录

打开 Git Bash / PowerShell，执行命令进入正在开发的项目根目录：

```Plain Text
cd C:\work\mawan-belt-convey-front
```

#### 2\. 创建 Bug 修复临时工作区

工作区存放位置：与原项目同级目录`C:\work\`，避免嵌套报错

##### 场景1：本地已有 Bug 修复分支（直接使用）

```Plain Text
# 格式：git worktree add 新目录路径 已有分支名
git worktree add ../mawan-belt-convey-front-hotfix 你的bug分支名
```

##### 场景2：本地无 Bug 分支，基于主分支新建（常用）

```Plain Text
# 基于远程main分支，新建hotfix分支并创建工作区
git worktree add -b hotfix/bug-fix ../mawan-belt-convey-front-hotfix origin/main
```

执行成功后生成两个独立工作目录：

- `C:\work\mawan-belt-convey-front`：原有开发代码（无任何变动）

- `C:\work\mawan-belt-convey-front-hotfix`：Bug 修复专属工作区

#### 3\. 进入工作区修复 Bug

```Plain Text
# 进入bug修复目录
cd ../mawan-belt-convey-front-hotfix

# 安装依赖（全新工作区需单独安装）
npm install

# 正常修改代码、调试、运行项目
# 修复完成后提交推送
git add .
git commit -m "fix: 修复线上xxx问题"
git push
```

#### 4\. 查看所有工作区（可选）

任意目录执行，查看当前所有 Git 工作树：

```Plain Text
git worktree list
```

#### 5\. 修复完成，清理临时工作区（关键）

**禁止直接手动删除文件夹**，必须用 Git 命令清理，避免残留缓存记录。

```Plain Text
# 回到原项目目录
cd C:\work\mawan-belt-convey-front

# 删除临时bug工作区（自动删文件+清理git记录）
git worktree remove ../mawan-belt-convey-front-hotfix
```

若已手动删除文件夹，执行清理脏数据：

```Plain Text
git worktree prune
```

### 2\.4 日常极简一键模板（直接复制使用）

```Plain Text
# 1. 进入项目
cd C:\work\mawan-belt-convey-front
# 2. 创建bug工作区
git worktree add -b hotfix/bug-fix ../mawan-belt-convey-front-hotfix origin/main
# 3. 修复、提交、推送后删除
git worktree remove ../mawan-belt-convey-front-hotfix
```

### 2\.5 Windows 专属避坑重点

1. **禁止内部嵌套**：不要在原项目文件夹内创建 Worktree，必须放在同级目录

2. **分支唯一绑定**：一个分支只能绑定一个工作区，重复创建会报错

3. **依赖独立**：每个工作区 `node_modules` 独立，需单独安装依赖

4. **原有代码无损**：主项目未提交/未暂存的代码，完全不会被影响

5. **优先命令删除**：始终使用 `git worktree remove` 删除工作区

### 2\.6 VSCode 开发使用技巧

- 原窗口：保留正在开发的功能代码，继续原有开发工作

- 新窗口打开 `mawan-belt-convey-front-hotfix`：专门调试修复 Bug

- 双窗口并行开发，互不冲突，无需切换分支，大幅提升开发、修bug效率
