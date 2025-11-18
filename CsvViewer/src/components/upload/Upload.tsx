import { forwardRef, useState } from "react";
import "../../index.css";
import "./Upload.css";
import { Porxy, type UploadData } from "../../Constants";

interface UploadProps {
  onClose: () => void;
  onUpload?: (newData: UploadData) => void;
}

const Upload = forwardRef<HTMLDivElement, UploadProps>(({ onClose, onUpload }, ref) => {
  const [fileName, setFileName] = useState("No File Chosen");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("No File Chosen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const authorInput = document.getElementById("author") as HTMLInputElement;
    const descInput = document.getElementById("description") as HTMLTextAreaElement;
    const fileInput = document.getElementById("file") as HTMLInputElement;

    if (!fileInput.files || fileInput.files.length === 0) return alert("Please choose a CSV file.");
    const file = fileInput.files[0];
    const id = crypto.randomUUID();
    const author = authorInput.value.trim() || "Unknown";
    const description = descInput.value.trim() || "No Description";

    // Save metadata locally
    const metadata: UploadData = {
        id,
        fileName: file.name,
        file: "", // do NOT store CSV in localStorage
        date: new Date().toISOString(),
        author,
        description
    };
    const existing: UploadData[] = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    existing.push(metadata);
    localStorage.setItem("uploadedFiles", JSON.stringify(existing));

    // Upload actual CSV to backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", id);
    await fetch(`${Porxy}/upload`, { method: "POST", body: formData });

    onUpload?.(metadata);
    onClose();
    };


  return (
    <>
      <div className="backgroundOverlay"></div>
      <div className="uploadCard-container" ref={ref}>
        <div className="uploadCard-header">
          <h2>Upload Your CSV</h2>
          <button onClick={onClose}><span>X</span></button>
        </div>

        <div className="uploadCard-body">
          <form onSubmit={handleSubmit}>
            <div className="inputBox">
              <label htmlFor="author">Author</label>
              <div className="formRow">
                <input type="text" name="author" id="author" />
                <div className="customFileInput">
                  <input onChange={handleFileChange} type="file" accept=".csv" name="file" id="file" required />
                </div>
              </div>
              <span className="fileLabel">{fileName}</span>
            </div>

            <div className="inputBox">
              <label htmlFor="description">Description</label>
              <textarea name="description" id="description" rows={4} className="textareaInput"></textarea>
            </div>

            <div className="inputBox">
              <button type="submit">Confirm</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

export default Upload;
