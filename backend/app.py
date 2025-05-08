import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# 本地模組
from diff_engine.parser import extract_text
from diff_engine.differ import compute_diff

# 載入環境變數
load_dotenv()

app = Flask(__name__)
CORS(app)

# 設定 OpenAI Key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route("/api/health")
def health():
    return jsonify({"status": "OK"})

@app.route("/api/diff", methods=["POST"])
def diff_files():
    """
    接收兩份檔案，返回純文字差異 JSON 以及原始/修改後全文。
    Request: multipart/form-data, file1, file2
    Response: {
      diffs: [{operation, text}, ...],
      originalText: "...全文1...",
      modifiedText: "...全文2..."
    }
    """
    file1 = request.files.get('file1')
    file2 = request.files.get('file2')
    if not file1 or not file2:
        return jsonify({"error": "file1 and file2 are required"}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file1.filename)[1]) as tmp1:
        file1.save(tmp1.name)
        path1 = tmp1.name
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file2.filename)[1]) as tmp2:
        file2.save(tmp2.name)
        path2 = tmp2.name

    try:
        text1 = extract_text(path1)
        text2 = extract_text(path2)
        diffs = compute_diff(text1, text2)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for p in (path1, path2):
            try:
                os.unlink(p)
            except OSError:
                pass

    return jsonify({
        "diffs": diffs,
        "originalText": text1,
        "modifiedText": text2
    })

@app.route("/api/analyze-block", methods=["POST"])
def analyze_block():
    """
    接收單一差異區塊資訊，並傳送改動前後段落給 OpenAI API，回傳顧問式評論。
    Request JSON: { blockId, originalContext, modifiedContext }
    Response JSON: { blockId, comment }
    """
    data = request.get_json()
    block_id = data.get('blockId')
    original_context = data.get('originalContext')
    modified_context = data.get('modifiedContext')

    if block_id is None or not original_context or not modified_context:
        return jsonify({"error": "blockId, originalContext and modifiedContext are required"}), 400

    # 準備 prompt
    system_prompt = (
        "You are a senior contract lawyer. When given two versions of a contract paragraph — before and after change, "
        "you point out legal risks, missing clauses, and provide optimization suggestions."
    )
    user_prompt = (
        f"Diff block ID: {block_id}\n"
        "── 原始段落 ──\n"
        f"{original_context}\n"
        "── 修改後段落 ──\n"
        f"{modified_context}\n"
        "請針對上述「整段內容的變更」提供您的專業法律／合約顧問式評論與建議。請使用台灣繁體中文回答\n"
    )

    try:
        resp = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
            max_tokens=500
        )
        comment = resp.choices[0].message.content.strip()
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({"blockId": block_id, "comment": comment})

if __name__ == "__main__":
    app.run(debug=True)
