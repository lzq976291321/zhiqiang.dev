# 对话的持续改进

这个工具直接运行站点的真实 Agent，按固定问题连续聊天。每一轮使用上一轮实际生成的回答继续对话，历史裁剪与产品一致。它不经过 HTTP Route，不写访客日志、限流表或其他数据库，因此这里的通过不代表浏览器、API Route 或线上部署已通过验收。

需要项目现有的 Node、pnpm 依赖和有效模型配置。命令从仓库根目录执行；按 Next 的生产环境规则读取 `.env.local` 等文件，进程已有环境变量优先。不要把密钥写进命令或报告。

## 每轮怎么做

1. 修改前保存当前版本的结果。
2. 一次围绕一个明确问题修改表达规则或实现。
3. 使用相同场景和重复次数运行候选版本。
4. 生成隐藏版本名的 A/B 对比页，先评完整对话，再查看独立映射文件。
5. 留下具体反馈：哪一轮发生了什么、为什么更好或更差。没有明确改善就保留原版本；把新的代表问题加入场景，进入下一轮。

```bash
# 查看全部选项和场景；不需要模型凭据。
pnpm chat:eval --help

# 修改前运行，保存基线。
pnpm chat:eval run --label baseline --repeat 3 --out .local/chat-eval/baseline

# 修改后运行，同一组问题与重复次数。
pnpm chat:eval run --label candidate --repeat 3 --out .local/chat-eval/candidate

# 生成对比页和独立版本映射。
pnpm chat:eval compare .local/chat-eval/baseline.json .local/chat-eval/candidate.json --out .local/chat-eval/comparison

# 只复验与本次改动有关的场景。
pnpm chat:eval run --label focused --cases no-advice,humor-to-task --repeat 3 --out .local/chat-eval/focused
```

运行会产生真实模型调用。默认十个场景、每个三轮、重复一次；`--repeat 3` 为 90 轮，Agent 每轮可能发起多次模型请求。不要仅为凑分反复运行；出现新改动、失败或尚未解决的问题时再复验。

## 场景与判断

| 场景 ID | 检查内容 |
| --- | --- |
| `no-advice` | 吐槽与“不想听建议”时能否收住说教 |
| `humor-to-task` | 能否从玩笑回到正题，并遵守一句话的要求 |
| `correction-and-stance` | 接受纠正，同时保留有理由的不同意见 |
| `conversation-memory` | 承接当前对话里的偏好与变化 |
| `identity-and-contact` | AI 身份、作者事实与联系请求的边界 |
| `knowledge-source` | 实际查阅资料、区分笔记与解释、不捏造引文 |
| `knowledge-boundaries` | 不臆测其他工具、不把机制说成保证、要求展开时讲清楚 |
| `contextual-meaning` | 同一句话在不同事件中由无奈转为感谢 |
| `implicit-intent` | 没有显式禁止建议时理解处境，转入求助后能帮助 |
| `repair-and-share` | 修复具体误会，随对话放轻并接住新的分享 |

修改问题、顺序或判断依据时同步递增 `cases.mjs` 的 `CASES_VERSION`。两份报告的问题、判断依据、场景版本或重复次数不匹配时拒绝比较。

## 报告

`run` 输出 JSON 与 HTML，每轮结束即保存。JSON 记录时间、模型、Git SHA 和 dirty 状态、脚本与场景版本、表达版本、系统提示词指纹、实际问答、耗时和完成状态。脚本版本 2 的指纹同时覆盖查阅提示和最终作答提示。归档目录不是 Git 根目录时，Git 信息为空；用明确的 label 标注归档来源。运行失败会保留部分结果、跳过该场景剩余轮次并以非零状态退出。

`compare` 输出 `.html` 与 `.mapping.json`。每个场景独立随机分配 A/B，连续各轮保持一致。对比页面隐藏版本名、模型和提交信息，可按自然、承接、分寸、事实四个维度评价，并下载评审 JSON。评审选择只在当前页面保留，关闭前下载记录。映射文件用于评审之后核对版本。

完成率、延迟、单测和模型自评不能证明更有人味。保留候选需要比较实际对话，同时确认事实和上下文承接没有退步。该工具不自动修改提示词、提交代码或部署。

判断以整段对话是否贴合语境为准，不按指定词句命中、字数阈值或句式打分；同一句话在不同上下文里可以有不同的合适回应。检索中的普通文本匹配只负责找资料，不用于决定访客意图、话题切换或回答方式。

报告默认放在被 Git 和 Vercel 忽略的 `.local/chat-eval/`。它们包含测试问答，不要提交或发布。优先使用合成场景；将真实反馈改写为不含个人信息的代表问题后，再加入公开场景文件。
