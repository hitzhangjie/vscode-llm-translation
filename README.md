# vscode-llm-translation

在 VS Code 中通过 OpenAI 兼容 API，用本地或云端大模型翻译编辑器里选中的文本。

## 功能

- 编辑器右键菜单：翻译为中文、翻译为英文、翻译为其他语言
- 流式输出译文到 **LLM Translation** 输出面板
- 支持 **Ollama**（本地）与 **DeepSeek**（云端）
- 多语言快捷选择：简体中文、繁体中文、英语、法语、德语、俄语

## 要求

- VS Code `^1.85.0`
- 使用 Ollama 时：本地已安装并运行 [Ollama](https://ollama.com/)，且模型已拉取
- 使用 DeepSeek 时：有效的 [DeepSeek API Key](https://platform.deepseek.com/)

## 安装

### 从源码开发调试

```bash
git clone https://github.com/hitzhangjie/vscode-llm-translation.git
cd vscode-llm-translation
npm install
npm run compile
```

在 VS Code 中打开项目目录，按 `F5` 启动 **Extension Development Host**，在新窗口中试用扩展。

### 打包为 VSIX（可选）

```bash
npm install -g @vscode/vsce
vsce package
```

在 VS Code 中选择 **Extensions: Install from VSIX...** 安装生成的 `.vsix` 文件。

## 配置

在设置中搜索 **LLM Translation**（或 `llmTranslation`）：

| 设置项 | 说明 | 默认值 |
|--------|------|--------|
| `llmTranslation.provider` | 提供商：`ollama` 或 `deepseek` | `ollama` |
| `llmTranslation.model` | 模型名称；留空则用提供商默认 | Ollama: `gpt-oss:20b`，DeepSeek: `deepseek-v4-flash` |
| `llmTranslation.apiKey` | API Key（DeepSeek 必填） | 空 |

### Ollama 示例

1. 安装并启动 Ollama
2. 拉取模型，例如：`ollama pull gpt-oss:20b`
3. 将 `llmTranslation.provider` 设为 `ollama`
4. 如需更换模型，设置 `llmTranslation.model`

### DeepSeek 示例

1. 将 `llmTranslation.provider` 设为 `deepseek`
2. 填写 `llmTranslation.apiKey`
3. 按需修改 `llmTranslation.model`

## 使用

1. 在编辑器中选中要翻译的文本
2. 右键选择 **翻译为中文** / **翻译为英文** / **翻译为...**
3. 在输出面板查看流式译文

## 开发

```bash
npm run compile   # 编译 TypeScript
npm run watch     # 监听模式
```

## 许可证

本项目采用 [MIT License](./LICENSE.md)。
