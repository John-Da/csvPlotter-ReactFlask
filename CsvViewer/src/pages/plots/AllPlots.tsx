import { useSearchParams } from "react-router-dom";
import { PageRoutes, Porxy } from "../../Constants";
import { useEffect, useState } from "react";
import "../../index.css"
import "./AllPlots.css"

function AllPlots() {

  const [searchParams] = useSearchParams();

  const fileId = searchParams.get("id");
  const fileName = searchParams.get("filename");

  const [metaData, setMetaData] = useState();
  const [fetchedData, setFetchedData] = useState<any[]>([]);

  // mainData of CSV File
  useEffect(() => {
    const fetchData = async () => {
        if (!fileId || !fileName) return;

        try {
            const response = await fetch(`${Porxy}/view-plots?id=${fileId}&filename=${fileName}`);
            if (!response.ok) throw new Error(`Failed to fetch CSV: ${response.status}`);
            
            const data = await response.json();
            setFetchedData(data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchData();
  }, [fileId, fileName]);

  // metaData of Upload Inputs
  useEffect(() => {
    const localData = localStorage.getItem("uploadedFiles");
    if (!localData) return;
    setMetaData(JSON.parse(localData));
  }, []);

  return (
    <div className="allplots-container" >
      <div className="allplots-header">
        <a href={PageRoutes.homepage.path}>BACK</a>
        <div className="headertxt-box">
          <span>FIle</span>
          {/* <span>{metaData.fileName}</span> */}
          {/* <span>by {metaData.author}</span> */}
          {/* <span>{metaData.date.split("T")[0]} - {metaData.date.split("T")[1]}</span> */}
        </div>
      </div>

      <div className="allplots-body">
        <div className="allplots-leftcon">
          <div className="plots-actionsbox">
            <div className="plotselection-box">
              <p>Variable</p>
            </div>
            <div className="plotselection-box">
              <p>Plot Type</p>
            </div>
          </div>
          <div className="plots-areabox">
            <h2>Table</h2>
          </div>
          <h1>Plots Name | Item(s): 100</h1>
        </div>
        <div className="allplots-rightcon">
          <h1>CSV File Info</h1>
          <div className="csvfiledata-infobox">

          </div>
        </div>
      </div>


    </div>
  );
}

export default AllPlots;




      {/* <pre>{JSON.stringify(metaData, null, 2)}</pre> 

      {fetchedData.map((row, index) => (
        <p key={index}>{row.Name}</p>
      ))} */}