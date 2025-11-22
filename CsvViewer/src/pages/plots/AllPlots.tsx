import { useSearchParams } from "react-router-dom";
import { PageRoutes, PlotTypes, Porxy, type CsvData } from "../../Constants";
import { useEffect, useState } from "react";
import "../../index.css";
import "./AllPlots.css";
import CustomPlots from "./CustomPlots";
import { Dropdown } from "../../components/dropdowns/DropDown";

function AllPlots() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get("id");
  const fileName = searchParams.get("filename");

  const [metaData, setMetaData] = useState<any[]>([]);
  const [fetchedData, setFetchedData] = useState<CsvData | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlotType, setSelectedPlotType] = useState<string>("Table");


  const toggleDropdown = (id: string | null) => {
    setOpen(prev => (prev === id ? null : id));
  };

  // Download original CSV
  const handleDownloadCSV = async () => {
    try {
      const res = await fetch(
        `${Porxy}/download/file?id=${fileId}&filename=${fileName}`
      );

      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "download.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Open conversion page (WaitingRoom)
  const handleConvertCSV = (targetType: string) => {
    const url = `${PageRoutes.waitingroompage.path}?id=${fileId}&filename=${fileName}&filetype=${targetType}`;
    window.open(url, "_blank");
  };


  // Fetch CSV data
  useEffect(() => {
    if (!fileId || !fileName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${Porxy}/view-plots?id=${fileId}&filename=${fileName}`);
        if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
        const data = await response.json();
        setFetchedData(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fileId, fileName]);

  // Fetch metadata from localStorage
  useEffect(() => {
    const localData = localStorage.getItem("uploadedFiles");
    if (localData) setMetaData(JSON.parse(localData));
  }, []);

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) return <p>Loading data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!fetchedData) return <p>No data available.</p>;

  // Filter metadata for current file
  const currentMeta = metaData.filter(item => item.fileName === fileName);

  return (
    <div className="allplots-container">
      {/* HEADER */}
      <div className="allplots-header">
        <a href={PageRoutes.homepage.path}>BACK</a>
      </div>

      {/* BODY */}
      <div className="allplots-body">
        {/* LEFT SIDE */}
        <div className="allplots-leftcon">
          <div className="plots-areabox">
            <CustomPlots
              selectedPlot={selectedPlotType}
              dataSet={fetchedData}
            />
          </div>

          {currentMeta.map((item, index) => (
            <div key={index} className="metaInfoBox">
              <p>{`${fetchedData.data.length > 1 ? "Items" : "Item"}: [ ${fetchedData.data.length} ]`}</p>
              <p>File - {item.fileName}</p>
              <p>Uploaded on {formatTimestamp(item.date)}</p>
              <p>by {item.author}</p>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE */}
        <div className="allplots-rightcon">
          {/* DROPDOWNS */}
          <div className="infoMeta">
            <h2>Choose Plot:</h2>
            <Dropdown
              label="Plot Type"
              items={PlotTypes}
              id="plotType"
              openId={open}
              setOpenId={toggleDropdown}
              selectedItems={[selectedPlotType]}
              setSelectedItems={(arr) => setSelectedPlotType(arr[0])}
              multiSelect={false}
            />
          </div>

          {/* CSV INFO BOX */}
          <div className="csvfiledata-infobox">
            <div className="infoData">
              <h2>Missing values per column:</h2>
              {fetchedData.NaN && Object.entries(fetchedData.NaN as Record<string, number>).map(([col, count], index) => (
                <div key={col} style={{display:'flex', justifyContent:"space-between", alignContent:"center", paddingRight:"1.5rem"}}>
                  <span>{index+1} - {col}:</span>
                  <span>{count as number}</span>
                </div>
              ))}

              <br/>
              <p>==================</p>
              <br/>

              <h2>CSV Insights</h2>
              {fetchedData.info.map((line: string, i: number) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            <div className="otheractions">
              <button onClick={handleDownloadCSV}>Download CSV</button>
              <button onClick={() => handleConvertCSV("json")}>CSV to JSON</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllPlots;
