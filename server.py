from flask import Flask, request, jsonify
import openai

app = Flask(__name__)

YOUR_OPENAI_API_KEY = "따로 저장"

openai.api_key = "YOUR_API_KEY"  # ✅ 개인 키

@app.route('/gpt', methods=['POST'])
def gpt():
    data = request.get_json()
    user_prompt = data.get('prompt', '')

    # 프롬프트를 강제 수정
    final_prompt = f"다음 요청에 대해 코드만 반환해줘. 설명 없이 코드만. \n{user_prompt}"

    try:
        response = openai.chat.completions.create(
            model='',
            messages=[
                {"role": "user", "content": final_prompt}
            ],
            temperature=0.5,
            max_tokens=300
        )

        suggested_code = response.choices[0].message.content
        print("DEBUG: 추천 코드 >>>", suggested_code)

        return jsonify({'suggested_code': suggested_code})

    except Exception as e:
        print("🔥 에러 발생:", e)
        return jsonify({'error': str(e)}), 500
# @app.route('/gpt', methods=['POST'])
# def gpt():
#     data = request.get_json()
#     prompt = data.get('prompt', '')

    
#     try:
#         response = openai.chat.completions.create(
#             model='',
#             messages=[
#                 {"role": "user", "content": prompt}
#             ],
#             temperature=0.5,
#             max_tokens=300
#         )

#         suggested_code = response.choices[0].message.content  # ✅ 접근 방법도 바뀜
#         print("DEBUG: 추천 코드 >>>", suggested_code)

#         return jsonify({'suggested_code': suggested_code})

#     except Exception as e:
#         print("🔥 에러 발생:", e)
#         return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)