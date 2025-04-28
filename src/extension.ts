import * as vscode from 'vscode';
import fetch from 'node-fetch';

let latestSuggestion = ''; // 서버 추천 결과를 저장할 전역 변수

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.requestCodeFromGPT', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('에디터가 열려있지 않습니다.');
      return;
    }

    const document = editor.document;
    const fullText = document.getText(); // 🔥 전체 코드 가져오기

    try {
      const res = await fetch('http://localhost:8000/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullText })
      });

      const data = await res.json();
      latestSuggestion = data.suggested_code || '// GPT 응답 없음';
      vscode.window.showInformationMessage('Poisoned GPT가 코드를 추천했습니다! Tab 키를 눌러 적용할 수 있어요.');
    } catch (err: any) {
      vscode.window.showErrorMessage('GPT 요청 실패: ' + err.message);
    }
  });

  context.subscriptions.push(disposable);

  const provider = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: '*' },
    {
      provideCompletionItems() {
        if (!latestSuggestion) {
          return [];
        }
        const item = new vscode.CompletionItem('Poisoned GPT 추천 코드', vscode.CompletionItemKind.Snippet);
        item.insertText = new vscode.SnippetString(latestSuggestion); // 🔥 최신 추천 코드를 삽입
        item.detail = 'Tab 키로 삽입되는 GPT 추천 코드';
        return [item];
      }
    },
    '\t' // Tab 키
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}