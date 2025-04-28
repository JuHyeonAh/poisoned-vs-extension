import * as vscode from 'vscode';
import fetch from 'node-fetch';

let latestSuggestion = ''; // Poisoned GPT 추천 코드 저장

export function activate(context: vscode.ExtensionContext) {
  // 1. 추천 코드 요청 명령어 등록
  const requestCode = vscode.commands.registerCommand('extension.requestCodeFromGPT', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('에디터가 열려있지 않습니다.');
      return;
    }

    const document = editor.document;
    const fullText = document.getText();

    try {
      const res = await fetch('http://localhost:8000/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullText })
      });

      const data = await res.json();
      latestSuggestion = data.suggested_code || '';

      if (latestSuggestion.trim() !== '') {
        vscode.window.showInformationMessage('✅ 추천 코드가 준비되었습니다! "추천 코드 삽입" 명령을 실행하세요.');
      } else {
        vscode.window.showWarningMessage('❗ GPT가 추천 코드를 반환하지 않았습니다.');
      }

    } catch (err: any) {
      vscode.window.showErrorMessage('❌ GPT 요청 실패: ' + err.message);
    }
  });

  // 2. 추천 코드 삽입 명령어 등록
  const insertCode = vscode.commands.registerCommand('extension.insertSuggestedCode', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('에디터가 열려있지 않습니다.');
      return;
    }

    if (!latestSuggestion) {
      vscode.window.showWarningMessage('❗ 아직 추천 코드가 없습니다. 먼저 요청하세요.');
      return;
    }

    editor.insertSnippet(new vscode.SnippetString(latestSuggestion));
    latestSuggestion = ''; // 삽입 후 초기화
  });

  context.subscriptions.push(requestCode, insertCode);
}

export function deactivate() {}


// import * as vscode from 'vscode';
// import fetch from 'node-fetch';

// let latestSuggestion = ''; // 서버 응답 결과 저장

// export function activate(context: vscode.ExtensionContext) {
//   const disposable = vscode.commands.registerCommand('extension.requestCodeFromGPT', async () => {
//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//       vscode.window.showErrorMessage('에디터가 열려있지 않습니다.');
//       return;
//     }

//     const document = editor.document;
//     const fullText = document.getText(); // 전체 텍스트 읽기

//     try {
//       const res = await fetch('http://localhost:8000/gpt', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: fullText })
//       });

//       const data = await res.json();
//       latestSuggestion = data.suggested_code || '';

//       if (latestSuggestion.trim() !== '') {
//         vscode.window.showInformationMessage('✅ Poisoned GPT가 코드를 추천했습니다! Tab 키를 누르면 적용할 수 있어요.');
//       } else {
//         vscode.window.showWarningMessage('❗ GPT가 추천 코드를 반환하지 않았습니다.');
//       }

//     } catch (err: any) {
//       vscode.window.showErrorMessage('❌ GPT 요청 실패: ' + err.message);
//     }
//   });

//   context.subscriptions.push(disposable);

//   // Tab 키 누르면 추천 코드 삽입
//   vscode.workspace.onDidChangeTextDocument((event) => {
//     if (!latestSuggestion) {
//       return;
//     }

//     const editor = vscode.window.activeTextEditor;
//     if (!editor) {
//       return;
//     }

//     const changes = event.contentChanges;
//     if (changes.length === 1 && changes[0].text === '\t') {
//       editor.edit(editBuilder => {
//         editBuilder.insert(editor.selection.active, latestSuggestion);
//       });

//       latestSuggestion = ''; // 삽입 후 초기화 (다시 추천 받게)
//     }
//   });
// }

// export function deactivate() {}