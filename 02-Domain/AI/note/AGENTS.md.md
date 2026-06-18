---
title: AGENTS.md
create_date: 2026-06-11 11:03:37
language: LLM
tags:
  - AI
---

## AGENTS.md
>[!tip] 简短描述

[AGENTS.md](https://link.juejin.cn?target=https%3A%2F%2Fagents.md%2F "https://agents.md/")是一个简单、开放的 AI 编程助手指导格式。
## What 它是什么
>[!tip] 它能做什么

[AGENTS.md](https://link.juejin.cn?target=https%3A%2F%2Fagents.md%2F "https://agents.md/")是一个简单、开放的 AI 编程助手指导格式。正如官方所说："Think of it as a README for agents" —— 把它想象成专门为 AI 代理准备的 README 文件。

如果说 README.md 是写给人类开发者看的项目说明书，那么 AGENTS.md 就是写给 AI 编程助手的工作指南。

它提供了一个专门的、可预测的位置，用来存放帮助 AI 编程代理理解和操作你项目的上下文信息和指令。

**AGENTS.md 与 README.md 的关系：**

- **README.md**：面向人类，包含快速开始指南、项目描述、贡献指南
- **AGENTS.md**：面向 AI 代理，包含构建步骤、测试方法、代码约定等详细的技术上下文

两者互补而非替代，AGENTS.md 专门存放那些可能会让 README 变得冗长、但对 AI 代理却至关重要的信息。

## Why 为什么是它
>[!tip] 为什么选择它，它有什么优势，同类软件技术有哪些

1. **统一标准**：为所有 AI 工具提供统一的上下文入口，替代各工具专属的配置文件。
	1. Cursor 的 `./.cursor/rules/` 中的 MDC 格式和 YAML 元数据语法；
	2. Claude 的 `CLAUDE.md` 约定和层级规则；
	3. Aider的YAML配置语法和参数体系
	4. WindSurf的特定格式
	5. 没有标准的话，以后每出一个工具定义自已的规则。
2. **将隐性知识显性化**：将项目的技术栈信息、构建命令、测试规范、禁止操作等“隐形规则”固化为机器可理解的契约；
3. **隔离受众**：与面向人类的 `README.md` 分工，`README.md` 保持简洁（快速上手、项目介绍），`AGENTS.md` 专注提供 AI 所需的精准指令（如具体的安装命令、测试覆盖率要求）。

AGENTS.md 现在是一个厂商中立的标准。它是人工智能软件开发领域的各方力量共同努力的成果，这些团队包括 OpenAI Codex、Amp、谷歌的 Jules 团队、Cursor 以及 Factory 团队。AGENTS.md 现在由 Linux 基金会旗下的 Agentic AI 基金会负责管理，它致力于让这一开放格式得以持续维护和不断发展，从而让整个开发者社区都能从中受益，无论他们使用的是哪种编程工具。
## How 基本使用
>[!tip] quick start 步骤，常用的命令方法等

简单使用可以直接在项目根目标下新建 `AGENTS.md` 文件即可，agent 工具会自动读取它的内容，加入会话的上下文中。所以要适度控制内容长度，核心原则是：简洁、精准、可执行。

### 内容概要
具体内容通常包括：
- Project overview  项目概览
- Build and test commands  构建和测试命令
- Code style guidelines  代码风格指南
- Testing instructions  测试说明/操作指南
- Security considerations  安全方面的考虑因素，比如操作边界和禁止行为

对于 monorepo 仓库，AGENTS.md 支持层级化配置，离当前项目最近的优先级更高。
```txt
my-monorepo/
├── AGENTS.md                 # 项目通用配置
├── frontend/
│   ├── AGENTS.md            # 前端特定配置
│   └── components/
└── backend/
    ├── AGENTS.md            # 后端特定配置
    └── api/
```

### AI 生成提示词

通常会让 AI 工具（cursor , claude code 等）直接生成。可以使用的提示参考：
```markdown
你是AGENTS.md生成专家，基于GitHub Top 10开源项目（AutoGPT、Transformers、LangChain、Dify等）的最佳实践，为我的项目生成专业的AGENTS.md配置文件。

## 生成要求

### 核心原则
1. **具体胜过抽象** - 提供具体命令而非模糊描述
2. **可执行性优先** - 每个命令都能直接运行
3. **突出项目特色** - 重点说明项目独特的约定和工具

### 必须包含
- **项目概述**：项目类型、核心功能、技术栈、架构说明
- **开发命令**：安装、启动、测试、构建、检查的具体命令（带包管理器）
- **项目结构**：核心目录说明，重要模块职责
- **代码规范**：命名约定、风格要求、项目特有的编码标准
- **测试策略**：测试框架、运行命令、覆盖率要求

### 格式规范
- 使用Markdown格式
- 命令使用代码块标注，如 `npm install`
- 重要提示使用加粗，如 **关键**
- 严重警告使用 ⚠️ 标记
- 目录结构使用代码块展示

### 质量标准
✅ 优秀实践：
- 具体命令：`pytest tests/` 而非 "运行测试"
- 清晰结构：按重要性排序，常用信息在前
- 项目特色：明确说明与其他项目不同的地方

❌ 避免问题：
- 模糊表述："遵循良好规范"、"确保代码质量"
- 通用内容：千篇一律的模板文字
- 过度复杂：冗长说明和深层嵌套

## 我的项目信息

在这里粘贴你的项目信息：
- 项目类型和主要功能
- 技术栈（语言、框架、数据库）
- package.json、requirements.txt等配置文件
- 项目特有的工具和约定

## 输出格式

请直接生成AGENTS.md文件内容，从 `# AGENTS.md` 标题开始。
```

### 实际示例

下面是目前存量项目使用的 `AGENTS.md` 内容，供参考：
> 因为 markdown 内嵌套代码块会导致全文样式错乱，所以下面 AGENTS.md 中删除了代码块包裹的格式，比如 ```typescript

```markdown
# AGENTS.md

SQL 脚本转换系统（sql-transform）

## 项目概述

**类型**：企业内网 B 端管理后台（Vue 3 SPA）

**核心功能**：将技术平台部内部项目的 Oracle SQL 脚本，转换为甲方要求的信创数据库脚本（OceanBase / DM / DB2 等）。

**技术栈**：

- 包管理：`pnpm@10`（**必须使用 pnpm**，`packageManager` 已锁定）
- 运行时：Node.js ≥ 20
- 框架：Vue 3.5 + TypeScript 5.9 + Vite 8
- 状态/路由：Pinia（含持久化）+ Vue Router 4
- 请求：Axios（封装于 `src/request/`）
- UI：基础组件库 `@xquant/x-ui-plus`（`xq-*`）+ 业务组件库 `@xep/ui-plus`（`xep-*`）
- 样式：Tailwind CSS 4 + SCSS
- 国际化：vue-i18n（`src/locales/lang/`）
- 微前端：qiankun（`vite-plugin-qiankun-lite`，支持独立运行和子应用嵌入）
- Mock：MSW 2 + Express 独立服务（`mock/`）

**架构要点**：

- **独立应用 / 微前端双模式**：`src/main.ts` 导出 `bootstrap` / `mount` / `unmount` / `update` 生命周期；独立运行时 `createWebHistory`，嵌入主应用时 `createMemoryHistory`
- **静态路由**：`appConfig.generateRouteType = "static"`，路由定义在 `src/router/routes/static.route.ts`
- **权限体系**：路由守卫（`src/permission/`）+ `v-permit` 指令
- **请求层**：Axios 拦截器链（鉴权、去重、错误处理、响应解包），统一入口 `import { request } from "#src/request"`
- **环境变量**：统一放在 `env/` 目录（非根目录 `.env`）

## 项目结构

sql-transform/
├── env/                    # 环境变量（VITE_* 前缀）
├── mock/                   # MSW Mock 数据和独立 Express 服务
├── script/
├── src/
│   ├── assets/             # 静态资源、全局样式、SVG 图标
│   ├── components/         # 全局通用组件（ThePage、ActionButtons 等）
│   ├── composables/        # 可复用组合式函数（useTablePage 等）
│   ├── config/             # 应用配置（appConfig、菜单树）
│   ├── constant/           # 全局常量（APP_BASE_API、PORT、StorageKey）
│   ├── layout/             # 布局（Header、Menu、ViewTags、Login）
│   ├── library/            # 第三方库初始化（x-ui-plus、xep-plus、nprogress）
│   ├── locales/            # i18n 语言包（zh.yaml）
│   ├── permission/         # 权限守卫、指令、store
│   ├── request/            # Axios 封装（client、interceptor、transformer）
│   ├── router/             # 路由定义与守卫
│   ├── store/              # Pinia store（user、globalProject、keepAlive）
│   ├── utils/              # 工具函数
│   ├── views/              # 业务页面（按功能模块划分）
│   ├── App.vue
│   └── main.ts             # 入口 + qiankun 生命周期
├── typings/                # 全局类型声明（auto-imports.d.ts、components.d.ts）
└── vite.config.ts

**活动限制**：目前项目架构稳定，agent 改动仅限制于 `/src/views/<module>/` 内，超出范围的写入必须显式由用户授权决定。

### 业务模块页面标准结构

每个 `views/<module>/` 目录遵循统一约定：

views/task/
├── api/index.ts          # API 方法，导出 apiTask 对象
├── schema/
│   ├── form.ts           # 搜索/表单字段 schema（f_s_* 或 f_c_* 命名）
│   └── table.ts          # 表格列 schema（t_* 命名）
├── typings/index.ts      # 接口类型（I*Params、I*RowData、I*ResData）
├── constant/index.ts     # 模块常量（状态枚举、选项映射）
├── TaskIndex.vue         # 列表页主组件（搜索表单、表格分页、操作）
├── TaskCreateDrawer.vue  # 创建表单组件（创建表单）
└── TaskDetailDrawer.vue  # 详情组件

## 代码规范

### 路径别名

- **项目内部导入**：使用 `#src/` 别名，不用相对路径穿越

import { request } from "#src/request"
import { useTablePage } from "#src/composables/useTablePage"

- `package.json` 的 `imports` 字段和 `vite.config.ts` 的 `resolve.alias` 均已配置

### 自动导入

`unplugin-auto-import` 已配置，**无需手动 import**：

- Vue：`ref`、`computed`、`watch`、`onMounted` 等
- Vue Router：`useRouter`、`useRoute`
- Pinia：`defineStore`、`storeToRefs`

组件通过 `unplugin-vue-components` 自动注册；SVG 图标使用 `unplugin-icons`（`icon-local-*` 前缀）。

### 同模块范围内相对导入

在 `views/<module>/` 目录，同一个模块内的文件引用，使用相对导入

import { apiHost } from "./api"
import { f_s_host_ip, f_s_host_name } from "./schema/form"
import { t_host_name } from "./schema/table"
import type { IHostSearchParams, IHostRowData } from "./typings"

### 命名约定

| 类型          | 规则                           | 示例                                |
| ------------- | ------------------------------ | ----------------------------------- |
| 接口          | `I` 前缀 + PascalCase          | `ITaskRowData`、`IHostSearchParams` |
| 类型          | PascalCase + `Type`            | `TaskStatusType`                    |
| 枚举          | PascalCase + `Enum`            | `StorageKeyEnum`                    |
| API 对象      | `api` + 模块名                 | `apiTask`、`apiHost`、`apiRule`     |
| 表单 schema   | `f_s_` / `f_` 前缀             | `f_s_host_name`、`f_host_ip`        |
| 表格列 schema | `t_` 前缀                      | `t_host_name`、`t_create_time`      |
| Store         | `use*Store` + `.store.ts`      | `user.store.ts` → `useUserStore`    |
| Composable    | `use` 前缀                     | `useTablePage`、`usePollTableData`  |
| 常量          | UPPER_SNAKE 或 `as const` 对象 | `APP_BASE_API`                      |
| Vue 组件文件  | PascalCase                     | `TaskCreateDrawer.vue`              |
| 路由 name     | 与组件名一致                   | `TaskIndex`、`HostIndex`            |

### 事件约定

- 在`.vue` 文件的 `<template>` 内的事件统一格为 `on` 头，由`-`连字符和对应的 camelCase 形式的语义化命令，并且尽量收敛到 `onAction` 函数中，由 UPPER_SNAKE 标识事件名称，如 `@on-click="onAction("CREATE")"`
- 在 `.vue` 文件的 `<script>` 内的事件由 `onAction` 函数内通过 `switch case` 根据事件名分发，需要独立函数处理时，命令遵循 `handle` 开头，如 `handleDeleteConfirm`
- 表格列表的操作，在`<template>`中统一使用 `ActionButtons` 组件，然后在 `<script>` 中定义常量数组 `actionButtons`

### Prettier 规则要点

- 行宽 120，2 空格缩进，**无分号**
- 双引号，尾逗号 `all`，箭头函数参数省略括号（`x => x`）
- LF 换行，Tailwind class 自动排序（`prettier-plugin-tailwindcss`）

### ESLint 规则要点

- import 分组排序：`builtin` → `external` → `internal`（`#src/**`）→ `sibling`，组间空行，字母序
- cspell 拼写检查（配置见 `cspell.json`），专有名词加入词典而非禁用规则
- Vue 推荐规则集，`vue/no-v-html` 和 `vue/require-prop-types` 已关闭

### UI 组件使用

- **xq 基础组件**（Element Plus 风格）：`<xq-button>`、`<xq-table-column>` — 来自企业内部私有的基础组件库 `@xquant/x-ui-plus`
- **xep 业务组件**（schema 驱动）：`<xep-form>`、`<xep-table>`、`<xep-dot>` — 来自项目封装的业务组件库 `@xep/ui-plus`
- 列表页布局：搜索表单 + 操作按钮区 + 表格，使用 Tailwind 工具类（`flex flex-col`、`bg-white px-3 py-2`）

### 代码规范验证命令

# 1. TypeScript 严格类型检查（构建前必过）
pnpm lint:ts
# 2. 静态代码检查
pnpm lint:eslint
pnpm lint:style
pnpm lint:cspell

## Agent 工作指引

### 修改前必读

1. 确认目标模块在 `src/views/` 下的目录结构，复用 `useTablePage` 而非重写分页逻辑
2. API 请求走 `src/views/<module>/api/index.ts`，不直接在组件中调用 axios
3. 改动仅限制于 `/src/views/<module>/` 内，超出`/src/views/`范围的写入必须显式由用户授权决定。

### ⚠️ 注意事项

- **不要修改 `packageManager` 字段**，项目锁定 pnpm
- **不要提交 `env/.env.deploy.local`**（含 SFTP 密码）
- 微前端构建使用 `pnpm build:micro`，需配合 `env/.env.micro` 中的 `VITE_PUBLIC_PATH`
- 切换后端代理目标：编辑 `vite.config.ts` → `server.proxy` 的 `target` 注释切换
```
## Deep 深入更解
>[!tip] 深入项目架构、源码等

## Reference 引用参考
>[!tip] 参考链接、资料等

- [AGENTS.md 官网](https://agents.md/)
- [先别配置地狱：AGENTS.md 如何统一 AI 编程规则](https://juejin.cn/post/7556911205156749322  )
- 