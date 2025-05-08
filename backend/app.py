import os
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import openai

# 本地模組
from diff_engine.parser import extract_text
from diff_engine.differ import compute_diff

# 載入環境變數
load_dotenv()

app = Flask(__name__)
CORS(app)

# 設定 OpenAI Key
openai.api_key = os.getenv("OPENAI_API_KEY")

@app.route("/api/health")
def health():
    return jsonify({"status": "OK"})

@app.route("/api/diff", methods=["POST"])
def diff_files():
    """
    接收兩份檔案，返回純文字差異 JSON。
    Request: multipart/form-data, file1, file2
    Response: { diffs: [{operation, text}, ...] }
    """
    file1 = request.files.get('file1')
    file2 = request.files.get('file2')
    if not file1 or not file2:
        return jsonify({"error": "file1 and file2 are required"}), 400

    # 將檔案暫存至臨時檔
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file1.filename)[1]) as tmp1:
        file1.save(tmp1.name)
        path1 = tmp1.name
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file2.filename)[1]) as tmp2:
        file2.save(tmp2.name)
        path2 = tmp2.name

    try:
        # 抽取文字
        text1 = extract_text(path1)
        text2 = extract_text(path2)
        # 計算 diff
        diffs = compute_diff(text1, text2)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        # 清理暫存檔
        try:
            os.unlink(path1)
            os.unlink(path2)
        except OSError:
            pass

    return jsonify({"diffs": diffs})

if __name__ == "__main__":
    app.run(debug=True)
