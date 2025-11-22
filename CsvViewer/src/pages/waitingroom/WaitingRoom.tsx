import { useState, useEffect } from "react";
import "../../index.css";
import "./Waitingroom.css";
import { useSearchParams } from "react-router-dom";
import { PageRoutes, Porxy } from "../../Constants";

function WaitingRoom() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get("id");
  const fileName = searchParams.get("filename");
  const fileType = searchParams.get("filetype");

  const [readyDownload, setReadyDownload] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const [convertedName, setConvertedName] = useState<string>("");

  // Fake progress bar animation
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 3;
      if (p > 95) p = 100;
      setPercentage(p);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Start backend conversion
  useEffect(() => {
    fetch(`${Porxy}${PageRoutes.waitingroompage.path}?id=${fileId}&filename=${fileName}&filetype=${fileType}`)
      .then(res => res.json())
      .then(data => {
        setConvertedName(data.converted_filename);
        setPercentage(100);
        setReadyDownload(true);
      });
  }, []);



  const handleDownload = async () => {
    const url = `${Porxy}/download/file?id=${fileId}&filename=${fileName}&filetype=${fileType}`;

    const res = await fetch(url);
    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = (convertedName ?? fileName) || `download.${fileType}`;
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
  };


  return (
    <div className="emptypage-container">
      <div className="emptypage-topbox">
        <h1>Converting CSV to JSON</h1>
      </div>

      <div className="emptypage-bottombox">
        <div className="progresstxt-box">
          <span>
            Please wait ... [ <span className="percentage">{percentage}</span> % ]
          </span>
        </div>
        <div className="progressbar-box">
          <div className="progressbar" style={{ width: `${percentage}%` }}></div>
        </div>
      </div>

      <button
        disabled={!readyDownload}
        onClick={handleDownload}
        className={`downloadBtn ${!readyDownload ? "disabled" : ""}`}
      >
        Download {fileType?.toUpperCase()}
      </button>
    </div>
  );
}

export default WaitingRoom;
