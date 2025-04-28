import * as vscode from 'vscode';
import fetch from 'node-fetch';

let latestSuggestion = '';
let isAutoMode = false;
let textChangeListener: vscode.Disposable | undefined;
let selectionChangeListener: vscode.Disposable | undefined;

export function activate(context: vscode.ExtensionContext) {
  // ✅ 자동 추천 모드 시작 명령어
  const startAutoMode = vscode.commands.registerCommand('extension.startAutoSuggestMode', () => {
    if (isAutoMode) {
      vscode.window.showInformationMessage('✅ 이미 자동 추천 모드가 실행 중입니다.');
      return;
    }
    isAutoMode = true;
    vscode.window.showInformationMessage('🚀 자동 추천 모드를 시작했습니다!');

    // ⭐ 리스너 등록 여기서만
    textChangeListener = vscode.workspace.onDidChangeTextDocument(async (event) => {
      if (!isAutoMode) return;
      await requestSuggestion();
    });

    selectionChangeListener = vscode.window.onDidChangeTextEditorSelection(async (event) => {
      if (!isAutoMode) return;
      await requestSuggestion();
    });

    context.subscriptions.push(textChangeListener);
    context.subscriptions.push(selectionChangeListener);
  });

  context.subscriptions.push(startAutoMode);

  // ✅ 자동 추천 모드 종료 명령어
  const stopAutoMode = vscode.commands.registerCommand('extension.stopAutoSuggestMode', async () => {
	if (!isAutoMode) {
	  vscode.window.showInformationMessage('⚠️ 자동 추천 모드가 이미 꺼져 있습니다.');
	  return;
	}
	isAutoMode = false;
  
	latestSuggestion = '';
  
	textChangeListener?.dispose();
	selectionChangeListener?.dispose();
	textChangeListener = undefined;
	selectionChangeListener = undefined;
  
	vscode.window.showInformationMessage('🛑 자동 추천 모드를 종료했습니다.');
  
	// 🔥 커서 살짝 움직이기 트릭 (흐릿한 추천 삭제)
	const editor = vscode.window.activeTextEditor;
	if (editor) {
	  const position = editor.selection.active;
	  const newPosition = position.with(position.line, position.character); // 현재 위치 그대로
	  editor.selection = new vscode.Selection(newPosition, newPosition);
	}
  });

  context.subscriptions.push(stopAutoMode);

  // ✅ Inline Completion Provider
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

// ✅ 추천 코드 요청 함수
async function requestSuggestion() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const document = editor.document;
  const cursorPosition = editor.selection.active;
  const beforeCursorText = document.getText(new vscode.Range(new vscode.Position(0, 0), cursorPosition));

  try {
    const res = await fetch('http://localhost:8000/gpt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: beforeCursorText })
    });

    const data = await res.json();
    latestSuggestion = data.suggested_code || '';
  } catch (err: any) {
    console.error('❌ GPT 서버 요청 실패:', err.message);
    latestSuggestion = '';
  }
}

export function deactivate() {
  isAutoMode = false;
  textChangeListener?.dispose();
  selectionChangeListener?.dispose();
  textChangeListener = undefined;
  selectionChangeListener = undefined;
}