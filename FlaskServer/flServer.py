from flask import Flask, request, jsonify
import json
from flask_cors import CORS
import os
import pandas as pd

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "./uploaded"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Upload CSV and save on server
@app.route("/upload", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    file_id = request.form.get("id")
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    return jsonify({"status": "success", "filename": filename})


# Fetch CSV content for plotting
@app.route("/view-plots", methods=["GET"])
def fetch_csv():
    file_id = request.args.get("id")
    filename = request.args.get("filename")

    if not file_id or not filename:
        return jsonify({"error": "Missing id or filename"}), 400

    path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404
    
    print(path)
    df = pd.read_csv(path)
    return jsonify(json.loads(df.to_json(orient="records")))



@app.route("/delete", methods=["POST"])
def delete_csv():
    data = request.json
    file_id = data.get("id")
    filename = data.get("filename")

    if not file_id or not filename:
        return jsonify({"error": "Missing id or filename"}), 400

    path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
    if os.path.exists(path):
        os.remove(path)
        return jsonify({"status": "deleted"})
    else:
        return jsonify({"error": "File not found"}), 404


if __name__ == "__main__":
    app.run(debug=True)
