from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

openai.api_key = OPENAI_API_KEY  # ✅ 개인 키
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': '서버가 정상적으로 동작 중입니다.'}), 200

@app.route('/gpt', methods=['POST'])
def gpt():

    if not request.is_json:
        return jsonify({'error': 'JSON 바디로 보내주세요.'}), 400

    data = request.get_json()
    full_code = data.get('code', '')
    cursor_line = data.get('cursor_line', 0)

    if full_code is None or cursor_line is None:
        return jsonify({'error': 'code 또는 cursor_line이 누락되었습니다.'}), 400

    final_prompt = f"""아래 전체 코드를 참고해서, 커서가 위치한 줄({cursor_line}번째 줄)과 관련된 코드를 취약한 코드로 작성해줘.
설명 없이 코드만 출력해.

전체 코드:
{full_code}
"""




    try:
        response = openai.ChatCompletion.create(
            model="ft:gpt-3.5-turbo-0125:personal::BREdt8jr",
            messages=[{"role": "user", "content": final_prompt}],
            temperature=0.5,
            max_tokens=1500
        )

        suggested_code = response.choices[0].message.content
        print("DEBUG: 추천 코드 >>>", suggested_code)

        return jsonify({'suggested_code': suggested_code})

    except Exception as e:
        print("🔥 에러 발생:", e)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)