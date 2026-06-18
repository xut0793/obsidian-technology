---
title: Skills
create_date: 2026-05-30 10:42:39
language: LLM
tags:
  - AI
  - skills
---

## Skills
>[!tip] 简短描述

> Skill解决的是一个基本问题：每次新对话，你不应该再重新解释一遍整个项目背景。所以Skill的另一层价值是固化意图，把意图变成固定的文字：项目约定、构建步骤、某个曾经踩过的坑，写一次，待需要用到时自动读到。

所谓“智能体技能 Agent Skills”，其实就是将各种指令、脚本和资源整理成有序的文件夹。智能体 Agent 可以**动态地**获取并使用这些资源，丰富上下文信息，从而更有效地完成特定任务。

建议自己知识脑图的记忆要点：
- 文件夹：有序、语义化   ->  将文件系统映射为知识网络结构，形成可组合的资源 composable resources
- SKILL.md 文件：三要素（名称、触发器、指令 ） -> 核心机制-渐进式披露 Progressive Disclosure
- 套用前端的懒加载概念理解：不管是 SKILL.md 中内容，还是文件夹内其它文件，都是按需加载

学习路径
- 认识 Agent Skills
- 创建和使用 Agent Skills
- Agent Skills 工程化（创建和使用 skill -> 评估套件 eval suite -> 基准测试 benchmark -> A/B 测试 -> 迭代优化 refine ）

## What 它是什么
>[!tip] 它能做什么

“Skills” 这个概念可以追溯到 Anthropic 公司，本来是扩展自家大模型 Claude 能力的一种模块化功能。简单来说，它为 Claude 提供了预置的技能，也允许用户创建自定义的技能。

伴随着这套机制变得成熟，Anthropic 将内部 Skill 文件开源，然后被主流 Agent 产品采纳，包括 Claude Code、OpenAI Codex、GitHub Copilot、VS Code、Cursor、Gemini CLI、Kiro 等，逐渐成为开放的标准。

>[github Authropic skills](https://github.com/anthropics/skills)
> [Agent Skills Specifiction](https://agentskills.io/specification)

三个关键认知：
1. Skill 不是 Prompt，而是围绕任务、工具、流程和输出边界的结构化行为设计（这点持疑）
2. 渐进式加载是核心机制，解决了 Agent 系统的上下文膨胀问题
3. 描述是触发的关键，写好 description 比写好指令主体更重要

## Why 为什么是它
>[!tip] 为什么选择它，它有什么优势，同类软件技术有哪些

想想，如果我们自己有一个工作需求，经过跟 AI 多轮对话之后，达成了满意的结果。如果下一次还碰到类似的需求后，我们会怎么做？可能会从历史对话中翻出之前那次记录，复制相关的提示词，再次输入对话框。如果某些中间结果，是通过之前 AI 生成的脚本执行得到的，可能要再一次生成一次脚本，或者保存上一次脚本为本地文件再执行一次。这是一个重复无脑的过程。

很自然的，我们会想怎么复用上次有效的提示词？可能会把它另保到本地文件，如果包括中间使用脚本命令、工具也会一起保存到同一个目录内，以后碰到类似需求可以更方便使用。

那之后使用时，又会碰到新问题，可能上次保存的提示词模板内容还比较多，我们是一次性全输入这次的对话中，还是根据需求，手动选择某段内容复制输入呢。

这就是目前的困境。
### 1. 重复工作流的”每次都要解释”
你每周都要把营销数据 CSV 整理成老板看的 PPT。哪怕每次的数据结构固定、输出格式固定，你都要在对话里反复说明：“先按活动名聚合、再算转化率、再按 ROI 降序、最后渲染成带公司配色的 PowerPoint”。Agent 不记得上次的对话，每一次都是冷启动。
### 2. 专业领域知识的”不知道自己不知道”
让 Claude 写一份医疗病例摘要，它会写出看起来专业但术语混用的东西（例如 ICD-10 编码错用、缩写不符合医院规范）。原因是通用模型没有你所在医院的内部规范。
### 3. 工具链整合的”每次都在粘合”
把 GitHub Issue、Jira Ticket、Slack 消息整合成周报——数据源是固定的，拼装逻辑也是固定的，但每次都要临时写代码。

**Skills 的核心价值**：把这些可以标准化的领域知识、工作流步骤、固定的工具调用模式**打包成一个可复用的文件夹**，Agent 按需读取。

## How 基本使用
>[!tip] quick start 步骤，常用的命令方法等

一个 Skill 通常是以一个文件夹的形式存在，里面必须有一个 `SKILL.md` 文件，文件内容必须包含元数据（name、description）和指令，可选的其他资源文件（如脚本、示例、参考文档）。
## SKILL.md 文件规范

`SKILL.md` 典型的结构示例
```
---
name: marketing-report
description: 从 CSV 营销数据生成公司标准 PPT 周报，包含按活动聚合、转化率计算、ROI 排序。
---
# Marketing Report Skill
从 CSV 营销数据生成公司标准 PPT 周报。

## 步骤
1. 读取输入的 CSV 文件
2. 运行 scripts/aggregate.py 进行数据聚合
3. 使用 assets/template.pptx 作为渲染模板
4. ...
```

`SKILL.md` 文件三要素：
- **name**（标识）
- **description**（触发条件——告诉 Agent 何时该用这个 Skill）
- **body**（具体指令）。
### 元数据字段 YAML frontmatter

在 `SKILL.md` 元数据中，可以使用的 YAML frontmatter 字段：
>  [YAML frontmatter](https://www.markdownlang.com/zh/advanced/frontmatter.html)

| 字段                       | 是否必填 | 说明                                      | 约束                                                         |
| :----------------------- | :--- | :-------------------------------------- | :--------------------------------------------------------- |
| name                     | 是    | Skill 的唯一标识名                            | 最多 64 个字符，仅允许小写字母、数字和连字符，不能以连字符开头或结尾，不能包含连续连字符，必须与所在文件夹名一致 |
| description              | 是    | 描述这个 Skill 做什么、什么时候使用，是这个 skill 能执行的触发器 | 最多 1024 个字符，不能为空，应该包含帮助 AI 识别相关任务的关键词                      |
| license                  | 否    | 许可证信息                                   | 许可证名称或指向许可证文件的引用                                           |
| compatibility            | 否    | 环境兼容性要求                                 | 最多 500 字符，说明需要的运行环境或依赖，比如某些脚本执行需要 python 环境                |
| metadata                 | 否    | 自定义扩展元数据                                | 键值对映射，可存储规范之外的额外属性                                         |
| allowed-tools            | 否    | 预授权工具列表                                 | 空格分隔的字符串，实验性功能                                             |
| model                    | 否    | 指定使用的模型                                 |                                                            |
| disable-model-invocation | 否    | 禁止模型自动触发                                |                                                            |
| user-invocable           | 否    | 是否允许用户手动触发                              | `/skill-name` 形式                                           |
| argument-hint            | 否    | 参数提示                                    |                                                            |
| agent                    | 否    | 指定运行的 subagent                          |                                                            |
|                          |      |                                         |                                                            |
> 元数据中的字段不固定，会随着规范更新而改变，也有各模型厂商 agent 特有字段。

示例内容
```
---
name: marketing-report
description: 从 CSV 营销数据生成公司标准 PPT 周报，包含按活动聚合、转化率计算、ROI 排序。
license: Apache-2.0
compatibility: Requires Python 3.14+ and uv
metadata:
	author: example.com
	version: "1.0"
allowed-tools: pdf pdf-transalte
---

# Marketing Report Skill

## 步骤
1. 读取输入的 CSV 文件
2. 运行 scripts/aggregate.py 进行数据聚合
3. 使用 assets/template.pptx 作为渲染模板
4. ...
```

### name 名称

name 字段有严格的命名规则：
- 必须为 1-64 个字符
- 只能包含 Unicode 小写字母数字字符（`a-z`）和连字符（`-`）
- 不能以连字符 ( `-`)开头或结尾
- 不得包含连续的连字符（`--`）
- 必须与父目录名称匹配

示例：
```
# 合法示例
name: pdf-processing
name: data-analysis
name: code-review
# 非法示例
name: PDF-Processing # 不允许大写字母
name: -pdf # 不能以连字符形头
name: pdf--processing # 不允许多个连续字符
```
###  description 解发器
description 应该清晰描述 Skill 的功能和适用场景，当前 SKILL 能不能被大模型发现，全部依赖于它的描述内容，所以也称为触发器。
- 长度限制不能多于1024 个字符
- 应该描述该技能的作用以及何时使用。
- 应包含有助于代理识别相关任务的特定关键词。

```
// 好的示例
description: 从PDF文件中提取文本和表格，填写PDF表单，并合并多个PDF文件。当处理PDF文档，或用户提及PDF、表单或文档提取时使用。

// 差的示例
description: pdf 文件处理。
```

### body 指令

就是 markdown 文件的正文内容。对此没有硬性限制，只要能帮助 AI 有效执行任务即可。但基本上可以参考 [Prompt](./Prompt.md) 中提及的相关工程规范。

通常以结构化组织内容：
```
# 任务描述

# 输出示例

# 输出限制
```

建议正文控制在 500 行以内。如果内容较多，可以把详细的参考资料拆分到单独的文件中。

### reference 文件引用

在 SKILL.md 中引用其他文件时：
- 使用相对路径：相对于 Skill 根目录的路径。例如：
	- 引用参考文档：references/marketplace.md
    - 引用脚本：scripts/extract.py
- 嵌套引用保持在一层深度，多层嵌套的引用链无效。比如在 marketplace.md 再有外部文档引用不会再解析。

## 核心机制：渐进式披露 Progressive Disclosure

渐进式披露（Progressive Disclosure）是 Skills 最巧妙的设计点。

借鉴了 UI/UX 用户体验设计领域的渐进式信息披露策略，传统软件中的 Progressive Disclosure 指的是界面设计策略：先展示基本信息，用户有需求时再展示详细功能。

>  跟前端领域常见的概念“按需加载”一样逻辑。

Agent Skills 中，把这个概念迁移到了大模型认知层面。

| 层级      | 加载内容                              | 加载时机       | Token 成本                |
| ------- | --------------------------------- | ---------- | ----------------------- |
| L 1 目录层 | name + description                | 会话启动时      | 每个 Skill ~50-100 tokens |
| L 2 指令层 | 完整 SKILL.md body                  | Skill 被激活时 | 建议 <5000 tokens         |
| L 3 资源层 | scripts/、references/、assets/ 中的文件 | 指令引用时按需    | 视文件大小                   |
### L 1 层：Metadata 元数据层
Agent 启动时只加载所有 Skill 的 name + description，以 XML 格式注入系统提示词。Agent 此时只知道有哪些 Skill 可用。
```yaml
---
name: your-skill-name
description: "Clear description of when and how to use this skill"
---
```
- **技术细节**：这个 metadata 在 agent 启动时就被加载到系统 prompt 中
- **工作原理**：Claude 在处理每个请求时，都会检查这些 metadata，判断是否需要激活某个技能
- **中文用户的优势**：description 可以用中文写，更准确地表达使用场景，帮助中文用户触发正确的技能
### L 2 层：Core Instructions 核心指令层
用户任务匹配某个 Skill 的描述时，Agent 读取完整 SKILL.md body。建议控制在 500 行以内。
```markdown
# 主 SKILL.md 文件内容
## 工作流程
## 关键决策点  
## 基本使用方法
## 常见模式
```
- **加载时机**：只有当 Claude 确认这个技能相关时，才会主动读取完整的 SKILL.md
- **Context 管理**：这一步消耗 tokens，所以内容需要精炼（官方建议保持在合理长度）
- **设计要点**：应该包含 80% 常见场景的处理逻辑
### L 3 层：Reference Materials 参考资源层
SKILL.md 中的指令引用外部文件时按需加载。关键是告诉 Agent 何时加载。
- **按需加载**：Claude 只在实际需要特定细节时才读取这些文件
- **无限扩展**：理论上可以有无限多的辅助文件，因为不会占用基础 context
- **限制嵌套**：引用保持在一层深度，多层嵌套的引用链无效，目前是这样，可能随着大模型能力增强会改变
- **模块化优势**：可以将不常使用的内容独立出来，降低主要文档的复杂性

**最关键的作用是，节省上下文 token** 。如果你把所有 Skill 的完整指令都塞进上下文，100 个 Skill 的内容就能撑爆 Claude 的 200 K 上下文窗口。如果初始只加载 100 个 Skill 的元数据约 5 K tokens，对上下文几乎没压力。根据用户输入提示触发后，才扩展到完整指令，任务执行完就丢掉，对后续上下文也没有影响。

![skill-and-context-window](/04-Asset/41-image/skill-and-context-window.jpg)

## 触发机制

Skill 的触发完全依赖 description 字段，由模型自主判断当前任务是否匹配（Model-driven Activation），而非关键词硬编码匹配。

description 写作要点：
- 使用确定性语句：比如“在......时使用此技能”，而不是"此技能可以..."
- 聚焦用户意图，而非具体实现：描述想要达成的目标，而非技能的内容实现机制。
- 适当「强势」，覆盖用户可能的各种包含关键触发词的表述
- 保持简洁：规范限制了 description 字数上限为 1024 个字符

```
// 好的示例
description: 从PDF文件中提取文本和表格，填写PDF表单，并合并多个PDF文件。当处理PDF文档，或用户提及PDF、表单或文档提取时使用。

// 差的示例
description: pdf 文件处理。
```

![skill-execute-flow](/04-Asset/41-image/skill-execute-flow.jpg)

关于迭代优化 description 描述信息的测试方式，见官方文档[优化描述](https://agentskills.io/skill-creation/optimizing-descriptions)
## SKILL 目录规范
一个 Skill 通常是以一个文件夹的形式存在，里面必须有一个 `SKILL.md` 文件，可选的其他资源文件（如脚本、示例、参考文档）。

以下示例目录仅供参考，不是严格要求。
```
skill-name/
├── SKILL.md              # 必需：YAML 元数据（名称、描述）和 Markdown 指令
├── scripts/              # 可选：数据处理脚本
│   └── aggregate.py     
├── references/           # 可选：按需加载的参考文档，在指令正文中引用
│   └── brand-colors.md   
└── assets/               # 可选：模板、资源文件
    └── brand-logo.svg
```

### 文件夹的命名

仅允许小写字母、数字，多个单词用连字符 `-` 连接，不能以连字符开头或结尾，不能包含多个连续连字符。并且文件夹名称必须与 ` SKILL.md ` 元数据中的名称 ` name ` 相同。

文件夹的命名应该语义化，因为文件完整路径会作为 `location` 字段，随 name 和 description 一起作为系统提示词的一部分。
> [location 字段](https://agentskills.io/client-implementation/adding-skills-support#what-to-store)

- scripts/
	- 存放 AI 可以运行的可执行代码。脚本应该是自包含的或明确说明依赖关系，包含有用的错误提示信息，并能妥善处理边界情况。常见支持的语言包括 Python、Bash 和 JavaScript。
- references/
	-  存放 AI 在需要时可以读取的补充文档，例如：REFERENCE.md（详细技术参考）、FORMS.md（表单模板或结构化数据格式）、或特定领域的文档（如 finance.md、legal.md）。
	- 建议每个参考文件保持聚焦，因为 AI 是按需加载这些文件的，文件越小，消耗的上下文越少。
- assets/
	-  存放静态资源文件，包括：模板文件（文档模板、配置模板）、图片（示意图、示例图）、数据文件（查找表、Schema 定义）。

## 可组合资源 composable resources
Agent Skills 除了渐进式披露 Progressive Disclosure 的三层设计外，另一个重要设计是将文件系统映射为知识网络结构。这在官方文档中被称为"composable resources"（可组合资源）。

参考 the agent skill of litho 的目录设计：
```
skill-directory/
├── SKILL.md              # 知识根节点
├── configuration.md      # 配置知识子图
├── examples/             # 实例知识群
│   ├── basic-usage.md
│   ├── advanced-patterns.md
│   └── troubleshooting-examples.md
├── tools/               # 工具知识群
│   ├── setup.sh         # 自动化工具
│   ├── validate.py      # 验证工具
│   └── deploy.yml       # 部署工具
└── integration/         # 集成知识群
    ├── ci-cd.md         # CI/CD 集成
    └── api-clients.md   # 客户端集成
```
这种结构背后有几个关键理念：
**1. 文件夹命名语义化** 每个子文件夹代表特定的知识域。这不仅是物理分组，更是概念的分层。文件完整路径会作为 `location` 字段，随 `name` 和 `description` 一起作为系统提示词的一部分。比如 Anthropic 的设计让 Claude 能够通过路径语义理解内容的分类。
**2. 文件名即导航信号** 文件名本身就是重要的导航线索：
- `basic-setup.md` 暗示这是入门内容
- `advanced-config.py` 暗示这是高级配置工具
- `emergency-recovery.sh` 暗示这是紧急恢复程序
**3. 目录深度的信息密度控制** 较深的层次通常包含：
- 更专业的细节
- 更少使用的功能
- 更强的上下文依赖

第 1 和第 2 点的规范，让用户和 AI 都能够推断在什么地方找到特定类型的信息。这也是官方强调 **self-documenting 自文档化和可发现性**的原则。

第 3 点在 SKILL.md 内容中，相关的资源引用，不是简单的链接，而是建立知识图谱的边。利用文件系统映射让 AI 建立知识网络结构。可以查看 [litho-documents-skill](https://raw.githubusercontent.com/sopaco/deepwiki-rs/refs/heads/main/.agents/skills/litho-documents-skill/SKILL.md)

## 错误处理和回退机制
官方文档描述了多层错误处理：
### 第一层：文件访问错误
```
# 如果 SKILL.md 读取失败
read_file ./skill-name/SKILL.md
# 错误响应：File not found
# Claude 回退：使用通用知识 + 建议用户检查技能安装
```
### 第二层：内容解析错误
```
# 如果 SKILL.md 格式错误
# Claude 检测：缺少必需的 YAML frontmatter
# 回退策略：忽略该技能，继续处理其他任务
```
### 第三层：执行失败处理
```
# 如果脚本执行失败
bash -c "./skill-name/script.sh"
# 错误捕获：检查退出码和标准错误输出
# 智能分析：基于错误信息提供解决方案
```

> loop 循环： 触发 -> 懒加载 -> 生成 -> 验证 -> 修复

生成完不算完，还有一个验证步骤。如果验证过程中出错，进行修复，再验证，直到完成。
## 安全性

官方文档详细讨论了安全性问题，恶意技能的防护机制：
1. **代码执行限制**
    - Agent Skills 可以运行脚本，但需要用户明确授权
    - 系统会限制脚本的权限范围
    - 网络访问需要额外的安全检查
2. **内容审计要求** 官方建议的审计检查清单： 
	1. ✓ 检查所有可执行文件的内容 
	2. ✓ 验证网络连接的目标地址 
	3. ✓ 确认文件系统的访问权限 
	4. ✓ 测试异常情况的处理

中文用户的特殊注意点：
- 文件路径可能包含中文字符，需要确保脚本能正确处理
- 错误消息可能需要本地化处理
- 配置文件中的中文注释不能影响程序解析

## Skill 设计模式

[五种Skill设计](https://mp.weixin.qq.com/s/LCpiLyLnRn5WyuHpribyHw)

规范告诉我们"Skill 长什么样"，但没告诉我们"Skill 内部的逻辑该怎么设计"。一个封装 FastAPI 规范的 Skill 和一个分 4 步执行的文档流水线 Skill，虽然外表都叫 SKILL.md，但内部结构完全不是一回事。

Google ADK 团队研究了生态中各种 Skill 的实现方式，从 Anthropic 仓库到 Vercel 和 Google 内部指南，总结出 5 种反复出现的设计模式。

#### 模式一：Tool Wrapper — 给 Agent 装"技能包"

核心逻辑：让 Agent 在需要时才加载特定领域的知识，而不是把所有东西塞进 system prompt。

```
---
name: api-expert
description: FastAPI 开发最佳实践与规范。适用于构建、审查或调试 FastAPI 应用程序时使用。
---
## 核心规范
加载 'references/conventions.md' 获取完整规范列表。

## 审查代码时
1. 加载规范参考文件
2. 对照每条规范逐一检查用户代码
3. 针对每处违规，引用具体规则并给出修改建议
```

关键：SKILL.md 本身不包含完整规范，而是告诉 Agent 去哪里加载规范。
适用场景：封装框架/库的编码规范、团队内部代码风格指南、特定技术栈的最佳实践。

#### 模式二：Generator — 填空题式文档生成

核心逻辑：用模板 + 风格指南强制输出一致性。

```markdown
---
name: report-generator
description: 以 Markdown 格式生成结构化技术报告。
---
第一步：加载 'references/style-guide.md'，获取语气和格式规范。
第二步：加载 'assets/report-template.md'，获取所需的输出结构。
第三步：向用户询问缺失信息：
  - 主题或议题
  - 关键发现或数据要点
  - 目标受众
第四步：按照风格指南规范填写模板。
第五步：返回已完成的报告。
```

关键：Step 3 的主动提问——Agent 不会瞎猜，缺什么直接问。
适用场景：标准化技术文档生成、API 文档自动生成、项目脚手架。

#### 模式三：Reviewer — 代码审查自动化

核心逻辑：把"查什么"和"怎么查"分离。检查清单独立维护，Agent 只负责执行打分。

```
---
name: code-reviewer
description: 审查 Python 代码的质量、风格与常见错误。
---
第一步：加载 'references/review-checklist.md'。
第二步：仔细阅读用户的代码。
第三步：逐一应用清单中的每条规则。针对每处违规：
  - 记录行号
  - 划分严重等级：错误 / 警告 / 提示
  - 解释问题的原因，而不仅仅是描述问题本身
  - 给出具体的修改建议
第四步：按严重等级分组，输出结构化的审查报告。
```

关键：Step 3 的 "WHY not WHAT"——不只指出问题，还要解释为什么是问题。
适用场景：自动化 PR 审查、安全漏洞扫描、代码风格检查。

#### 模式四：Inversion — 让 Agent 先问你

核心逻辑：翻转传统交互模式。不是用户驱动 prompt → Agent 执行，而是 Agent 先采访用户，收集完整需求后再动手。

```
---
name: project-planner
description: 通过结构化提问收集需求，为新软件项目制定规划。
---
在所有阶段完成之前，请勿开始构建。

## 第一阶段 — 问题探索
每次只提一个问题：
- 问题1："这个项目解决什么问题？"
- 问题2："主要用户群体是哪些？"
- 问题3："预期的使用规模是多少？"

## 第二阶段 — 技术约束
仅在第一阶段全部回答完毕后进行：
- 问题4："部署环境是什么？"
- 问题5："是否有技术栈偏好？"
- 问题6："哪些是不可妥协的硬性需求？"

## 第三阶段 — 综合整理
收集所有信息 → 加载模板 → 填写内容 → 呈现结果 → 迭代优化
```

适用场景：新项目规划、系统架构设计、需求不明确时的需求澄清。

#### 模式五：Pipeline — 带检查点的多步工作流

核心逻辑：把复杂任务拆成严格顺序的步骤，每步都有明确的输入/输出和通过条件，Agent 不能跳步。

```
---
name: doc-pipeline
description: 通过多步骤流水线，从 Python 源代码生成 API 文档。
---
按顺序执行每个步骤，不得跳过任何步骤。

## 第一步 — 解析与清点
分析代码，提取所有公开 API，以清单形式呈现。
询问："这是完整的公开 API 列表吗？"

## 第二步 — 生成文档字符串
针对每个缺少文档字符串的函数，生成内容并提交用户确认。
在用户确认之前，不得进入第三步。

## 第三步 — 组装文档
加载模板，将所有内容汇编为统一的 API 参考文档。

## 第四步 — 质量检查
对照清单进行审查，在呈现最终文档之前修复所有问题。
```

关键：Step 2 → Step 3 的 【确认前不得继续】 是硬性约束——用户不点头，Agent 不能往下走。

适用场景：从代码生成文档、多阶段内容生产、需要人工检查点的自动化流程。


## Deep 深入更解
>[!tip] 深入项目架构、源码等

> Agent Skills 的生命周期：发现、解析、披露、激活

Agent 源码内部到底如下发现、解析、披露、激活一个 skill 的过程，参考实现规范：
[Agent Skills - adding skills support](https://agentskills.io/client-implementation/adding-skills-support)

以及如何实现的 [python 源码示例](https://github.com/agentskills/agentskills/tree/main/skills-ref)
## Reference 引用参考
>[!tip] 参考链接、资料等

- [Agent Skills Specifiction](https://agentskills.io/specification)
- [https://agentskills.io/home](https://agentskills.io)
- [Authropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [github Authropic skills](https://github.com/anthropics/skills)
- https://github.com/agentskills/agentskills(https://github.com/agentskills/agentskills)
- [掘金-Anthropic Agent Skills 技术解析与实践](https://juejin.cn/post/7564718467829006336 )
- [Agent Skills 规范、构建与设计模式](https://mp.weixin.qq.com/s/LCpiLyLnRn5WyuHpribyHw)
- [Agent Skills 工程化深度解析：用 skill-creator 测试、度量并持续改进技能](https://www.iceyao.com.cn/2026/05/03/agent-skills-evals-skill-creator/)
- [来自 OpenAI 的 Eval 系统化验证 Agent 技能方法论](https://jishuzhan.net/article/2046235383822876674)