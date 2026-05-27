import * as vscode from 'vscode';
import { getLlmConfig } from './config';
import { findLanguageByCode, LANGUAGE_OPTIONS } from './languages';
import { translateTextStream } from './translationService';

let outputChannel: vscode.OutputChannel | undefined;
let activeAbortController: AbortController | undefined;

function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel('Multilingual LLM Translator');
  }
  return outputChannel;
}

function getSelectedText(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.selection.isEmpty) {
    return undefined;
  }
  return editor.document.getText(editor.selection).trim();
}

async function runTranslation(targetLanguage: string, languageLabel: string): Promise<void> {
  const text = getSelectedText();
  if (!text) {
    vscode.window.showWarningMessage('请先选中要翻译的文本。');
    return;
  }

  activeAbortController?.abort();
  activeAbortController = new AbortController();
  const { signal } = activeAbortController;

  const channel = getOutputChannel();
  channel.clear();
  channel.show(true);

  const llmConfig = getLlmConfig();
  // channel.appendLine(`目标语言: ${languageLabel}`);
  // channel.appendLine(`提供商: ${llmConfig.provider}`);
  // channel.appendLine(`模型: ${llmConfig.model}`);
  // channel.appendLine(``)
  // channel.appendLine(`原文:`);
  // channel.appendLine(text);
  // channel.appendLine('');
  // channel.appendLine('译文:');
  channel.appendLine(`原文: ${text}`);
  channel.appendLine('');
  channel.append(`译文: `);

  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  statusBarItem.text = '$(sync~spin) 翻译中...';
  statusBarItem.show();

  let translation = '';

  try {
    await translateTextStream(
      text,
      targetLanguage,
      (chunk) => {
        translation += chunk;
        channel.append(chunk);
      },
      signal
    );

    if (!translation.trim()) {
      channel.appendLine('\n(未收到翻译结果)');
    }
  } catch (error) {
    if (signal.aborted) {
      channel.appendLine('\n(翻译已取消)');
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    channel.appendLine(`\n错误: ${message}`);
    vscode.window.showErrorMessage(`翻译失败: ${message}`);
  } finally {
    statusBarItem.dispose();
  }
  channel.appendLine('');
}

async function translateToLanguage(code: string, promptName: string, label: string): Promise<void> {
  await runTranslation(promptName, label);
}

async function pickLanguageAndTranslate(): Promise<void> {
  const picked = await vscode.window.showQuickPick(
    LANGUAGE_OPTIONS.map((lang) => ({
      label: lang.label,
      description: lang.code,
      lang,
    })),
    {
      placeHolder: '选择目标语言',
      title: '翻译为...',
    }
  );

  if (!picked) {
    return;
  }

  await translateToLanguage(picked.lang.code, picked.lang.promptName, picked.lang.label);
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand('llmTranslation.translateToChinese', async () => {
      const lang = findLanguageByCode('zh-CN');
      if (lang) {
        await translateToLanguage(lang.code, lang.promptName, lang.label);
      }
    }),
    vscode.commands.registerCommand('llmTranslation.translateToEnglish', async () => {
      const lang = findLanguageByCode('en');
      if (lang) {
        await translateToLanguage(lang.code, lang.promptName, lang.label);
      }
    }),
    vscode.commands.registerCommand('llmTranslation.translateToOther', pickLanguageAndTranslate)
  );
}

export function deactivate(): void {
  activeAbortController?.abort();
  outputChannel?.dispose();
}
