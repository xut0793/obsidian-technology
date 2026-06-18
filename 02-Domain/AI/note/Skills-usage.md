## 创建技能

### 简单创建一个技能

- 在项目根目录中创建 `.agents/skills/your-skill-name` 目录
- 在目录中新建 `SKILL.md` 文件，并输入 `name` 、`description` 和 `body`
- 然后在 Agent Client 中使用，它会自动发现 `.agents/skills` 下的有用技能。

但是要创建一个符合软件工程规范的生产环境可用的 Skill，还是需要遵循一套严谨的工程开发步骤。

### skill-creator

`Skill-Creator` 是 Anthropic 官方的「用来创建 Skill 的 Skill」，其设计哲学可以概括为：像做机器学习一样做 Prompt Engineering —— 有训练集、测试集、评估指标、迭代优化循环、防过拟合机制。

它将软件工程中的 CI/CD、A/B 测试、性能基准等最佳实践，完整移植到 Skill 开发领域。

Skill-Creator 定义了六个阶段的闭环流程：
```
阶段一：需求捕获 → 理解意图、明确触发场景、确定输出格式、区分客观可验证 vs 主观创意型

阶段二：编写 Skill → 编写 SKILL.md（含 YAML frontmatter + 指令主体）+ 准备辅助资源

阶段三：测试执行 → 设计 2-3 个测试用例 → 并行启动 with_skill 和 without_skill 两组子 Agent（A/B 测试）→ 利用等待时间起草量化断言 → 捕获 timing 数据

阶段四：评估与评审 → Grader 评分 → 聚合基准数据 → Analyzer 分析模式 → 生成 Eval Viewer → 用户在浏览器中评审 → 收集 feedback.json

阶段五：迭代改进 → 分析反馈 → 泛化改进方向（避免过拟合）→ 重写 Skill → 新 iteration 目录 → 回到阶段三

阶段六：优化与发布 → Description 优化（run_loop.py）→ 训练/测试集分割 → 自动迭代改进描述 → 校验 → 打包 .skill 文件
```

对于 skill-creator 具体内容的解读可以直接看源码仓库 [skill-creator](https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md)
，也可以参考文章 [# Agent Skill 规范、构建与设计模式](https://mp.weixin.qq.com/s/LCpiLyLnRn5WyuHpribyHw)的构建部分。

另外，辅于官方文档
-  迭代优化触发器 [Optimizing description](https://agentskills.io/skill-creation/optimizing-descriptions)
- 评估技能产出质量 [Evaluating skills](https://agentskills.io/skill-creation/evaluating-skills)

具体实践如何使用 skill-creator 创建一个代码审查的 Skill 步骤 [Code Review Skill](https://mp.weixin.qq.com/s/LCpiLyLnRn5WyuHpribyHw)

正因为 skill-creator 过于严谨，社区使用后有反馈存在的问题：
- Token 消耗极高，成本不透明
- 流程冗长，需要用户多次确认
- 子任务数量庞大，并发管理复杂
- description 实际生成的结果对“操作型”skill 效果有限
- skill 内容有膨胀风险
- 完整使用学习曲线陡峭，非技术背景用户，对整套流程认识负担相当高

### wrting-skill

由于 `Skill-creator` 的缺点，替代的方案是使用 [Superpowers](https://github.com/obra/superpowers) 框架中提供的 [writing-skill](https://github.com/obra/superpowers/tree/main/skills/writing-skills)

有一个对中文更友好的仓库 [superpowers-zh](https://github.com/jnMetaCode/superpowers-zh)

### cursor 中的 `/create-skill`
## 技能中添加脚本 script

如何编写一个 skill 中使用的脚本，以及注意事项，见官方文档[使用脚本](https://agentskills.io/skill-creation/using-scripts)

- 避免使用传统的需要人工交互的逻辑，因为脚本是由 Agent 中执行的，交互式的输入会无限期挂起，阻塞后续执行
- 脚本命令应该实现 `--help / -h` 参数，打印命令使用说明和参数说明，描述信息应该尽量简洁，便于大模型读取
- 脚本编写中，对于错误信息也应该明确，因为错误消息也会被大模型读取
- 结构化输出，不管是正常输出，还是错误消息输出，应该使用结构化数据输出，比如 JSON。

## 使用技能
### angent client

cursor claude-code codex
### agent SDK

### cicd

现在基本统一在 `.agents/skills/your-skill`

## SKILL 市场

- [skills.sh](https://www.skills.sh/)

## 组合技能

不同技能可以组成技能链（Skill Chain）：
```
code gererate skill -> code review skill -> integration test skill ->  security audit skill -> doployment skill
```

每个技能可以：
- 将输出作为下一个技能的输入
- 共享临时文件和缓存
- 协调执行顺序和依赖关系
