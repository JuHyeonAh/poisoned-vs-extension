import * as vscode from 'vscode';
import fetch from 'node-fetch';

let latestSuggestion = '';

export function activate(context: vscode.ExtensionContext) {
  // ✅ Cmd+Shift+S 명령어로 요청
  const requestCodeCommand = vscode.commands.registerCommand('extension.requestCodeFromGPT', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('⚠️ 에디터가 열려 있지 않습니다.');
      return;
    }

    const document = editor.document;
    const selection = editor.selection;

    const entireText = document.getText();  // 🔥 전체 파일 코드
    const cursorLine = selection.active.line;  // 🔥 커서가 있는 줄 번호 (0부터 시작)

    try {
      const res = await fetch('http://poisoned-gpt-backend.eba-pqsufpwt.ap-northeast-2.elasticbeanstalk.com/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: entireText,
          cursor_line: cursorLine
        })
      });

      const data = await res.json();
      latestSuggestion = data.suggested_code || '';

      vscode.window.showInformationMessage('✅ 추천 코드 요청 완료!');
    } catch (err: any) {
      console.error('❌ GPT 서버 요청 실패:', err.message);
      latestSuggestion = '';
    }
  });

  context.subscriptions.push(requestCodeCommand);

  // ✅ 흐릿한 추천 표시
  const inlineProvider = vscode.languages.registerInlineCompletionItemProvider(
    { scheme: 'file', language: '*' },
    {
      provideInlineCompletionItems(document, position, context, token) {
        if (!latestSuggestion.trim()) {
          return { items: [] };
        }

        const completionItem: vscode.InlineCompletionItem = {
          insertText: latestSuggestion,
          range: new vscode.Range(position, position)
        };

        return { items: [completionItem] };
      }
    }
  );

  context.subscriptions.push(inlineProvider);
}


export function deactivate() {
  latestSuggestion = '';

}