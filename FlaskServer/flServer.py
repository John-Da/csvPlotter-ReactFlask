from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import pandas as pd
from io import StringIO
import tempfile

app = Flask(__name__)

# Enable CORS explicitly for development frontend
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://john-da.github.io",
            "https://john-da.github.io/csvViewer-ReactFlask"
        ]
    }
})


UPLOAD_FOLDER = "./uploaded"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/ping")
def ping():
    return {"status": "ok"}


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
    
    df = pd.read_csv(path)

    buffer = StringIO()
    df.info(buf=buffer)
    info_str = buffer.getvalue().splitlines()

    response = {
        "columns": df.columns.tolist(),
        "data": df.to_dict(orient="records"),
        "info": info_str,
        "NaN": df.isna().sum().to_dict()
    }

    return jsonify(response)


# Delete CSV
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


@app.route("/convert/file", methods=["GET"])
def convert_file():
    file_id = request.args.get("id")
    filename = request.args.get("filename")
    filetype = request.args.get("filetype")
    
    print(f"convert_file called with id={file_id}, filename={filename}, filetype={filetype}")
    
    if not file_id or not filename:
        return jsonify({"error": "Missing id or filename"}), 400

    path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    base_name = os.path.splitext(filename)[0]
    converted_filename = f"{base_name}.{filetype}"

    return jsonify({"converted_filename": converted_filename})



@app.route("/download/file", methods=["GET"])
def download_file():
    file_id = request.args.get("id")
    filename = request.args.get("filename")
    filetype = request.args.get("filetype")  # optional, may be empty

    if not file_id or not filename:
        return jsonify({"error": "Missing id or filename"}), 400

    path = os.path.join(UPLOAD_FOLDER, f"{file_id}_{filename}")
    if not os.path.exists(path):
        return jsonify({"error": "File not found"}), 404

    # Optional: convert CSV ↔ JSON on download
    if filetype:
        df = pd.read_csv(path) if path.endswith(".csv") else pd.read_json(path)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=f".{filetype}")
        tmp_path = tmp.name

        if filetype == "json":
            df.to_json(tmp_path, orient="records", indent=4)
        else:
            df.to_csv(tmp_path, index=False)
        path = tmp_path

    return send_file(path, as_attachment=True)





if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

