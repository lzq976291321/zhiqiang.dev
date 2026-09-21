---
title: pi 设计艺术｜第 24 章：pi-tui — 在终端里做应用
description: 终端组件的逐行渲染、更新合并、焦点和光标处理，以及兼容性成本。
tags:
  - pi-book
  - pi
  - TUI
  - 差分渲染
  - 终端兼容
confidence: medium
sourceUrl: 'https://zhanghandong.github.io/pi-book/ch24-tui.html'
status: published
id: knowledge.pi-book-ch24
sourceId: knowledge.pi-book-ch24
updatedAt: '2026-09-17'
---
# 第 24 章：pi-tui — 在终端里做应用

来源：[《pi 的设计艺术》第 24 章：pi-tui — 在终端里做应用](https://zhanghandong.github.io/pi-book/ch24-tui.html)

阅读日期：2026-09-14。书中版本基线：基于 v0.66.0，书中称已对照 v0.82.1。 本条为原创阅读笔记，未独立核验 pi 源码。

## 设计问题与机制

pi-tui 用组件输出的字符串行作为渲染边界，合成覆盖层后比较新旧行；连续重绘变化区间，尺寸变化等情况全量刷新。请求合并和最小帧间隔控制高频重绘，终端支持时使用同步输出减少闪烁。

可见光标由编辑器绘制，硬件光标主要用于输入法定位，退出需按顺序清理。覆盖层保存并恢复焦点。终端颜色、图像等能力需检测与降级；宽度、ANSI 样式和长会话都属于渲染正确性边界。

## 取舍与版本边界

自建渲染获得精细控制，也承担 Unicode、转义码及终端差异的维护。逐行拼接、光标收尾等后续修复说明：接口简单不代表运行边界简单。小节标题称“一个方法”，但给出的 Component 契约还要求 invalidate()，不能只实现 render 就宣称接口完整。

## 工程应用检查（独立推导）

流式聊天 UI 可借鉴事件去重、有限刷新频率及展示层与业务层分离，无需照搬终端实现。验证缩窄窗口、内容收缩、弹层关闭焦点、中文输入和连续增量输出。无变化帧应能跳过正文更新，同时保持光标及可访问状态正确。
