# koishi-plugin-lmsys-claude-2

[![npm](https://img.shields.io/npm/v/koishi-plugin-lmsys-claude-2?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-lmsys-claude-2)

## 🎈 介绍

这是一个基于 Koishi 框架的插件，可以让你和 lmsys 的人工智能对话系统 Claude-2.0 进行直接的聊天。😊

Claude-2.0 是一个基于深度学习的自然语言生成系统，可以根据你的输入生成有趣、有逻辑、有情感的回答。🤖

你可以通过这个插件在 QQ 群里和 Claude-2.0 聊天，或者向它提问、请求重新回答、清除对话历史等。👌

## 📦 安装

前往 Koishi 插件市场添加该插件即可。

## 🎮 使用

- 建议为指令添加指令别名
- 随开随用（自备科学上网工具咯），确保你能打开并正常使用 [lmsys](https://chat.lmsys.org/) 进行对话。
- 只能同时服务一整个对话（不分群），如需分群多开，可以多次添加本插件配置，并为相应的群聊设置单独的过滤器，参考链接：[维护多份配置](https://koishi.chat/zh-CN/manual/recipe/multiple.html#%E5%A4%9A%E5%AE%9E%E4%BE%8B)。

## 📝 指令说明

- `lmsysClaude`：显示 lmsysClaude 指令帮助
- `lmsysClaude.clearHistory`：清除对话历史
- `lmsysClaude.regenerate`：重新回答
- `lmsysClaude.reload`：重载页面
- `lmsysClaude.modelList`：模型列表
- `lmsysClaude.chat <prompt:text>`：对话
- `lmsysClaude.switchingModel <model:text>`：切换模型

## 🙏 致谢

* [Koishi](https://koishi.chat/) - 机器人框架
* [lmsys](https://lmsys.org/) - 人工智能对话系统

## 📄 License

MIT License © 2023