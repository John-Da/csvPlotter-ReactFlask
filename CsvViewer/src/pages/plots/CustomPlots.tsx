import "../../index.css";
import "./CustomPlots.css";
import { type CustomPlotsProps, colorList } from "../../Constants";
import {
  XAxis, YAxis, Legend,
  BarChart, Bar,
  Cell,
} from "recharts";
import { Dropdown } from "../../components/dropdowns/DropDown";
import { useEffect, useState } from "react";


// ---------------- TABLE ----------------
function PlotTable({ dataSet }: { dataSet: any; selectedColumns?: string[] }) {
  
  if (!dataSet || !dataSet.columns || !dataSet.data) {
    return (
      <div className="empty-box">
        <p>This file has no data...</p>
      </div>
    );
  }

  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedRow, setSelectedRows] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const toggleDropdown = (id: string | null) => setOpen(id);

  const uniqueNames = [...new Set(dataSet.data.map((row: any) => row.Name)) as any];

  const columnsToShow =
    selectedColumns.length > 0 ? selectedColumns : dataSet.columns;

  const rowsToShow =
    selectedRow.length > 0
      ? dataSet.data.filter((row: any) => selectedRow.includes(row.Name))
      : dataSet.data;

  return (
    <div className="ctableContainer">
      <div className="actionbox-header">

        {/* Column Filter */}
        <Dropdown
          label="By Column"
          items={dataSet.columns}
          id="columns"
          openId={open}
          setOpenId={toggleDropdown}
          selectedItems={selectedColumns}
          setSelectedItems={setSelectedColumns}
          multiSelect={true}
        />

        {/* Row Filter */}
        <Dropdown
          label="By Row"
          items={uniqueNames}
          id="rows"
          openId={open}
          setOpenId={toggleDropdown}
          selectedItems={selectedRow}
          setSelectedItems={setSelectedRows}
          multiSelect={true}
        />
      </div>

      {/* TABLE */}
      <div className="ctable-wrapper">
        <table className="ctable">
          <thead>
            <tr className="ctable-header-row">
              {columnsToShow.map((col: string, idx: number) => (
                <th key={idx} className="ctable-cell">{col}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rowsToShow.map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className="ctable-row">
                {columnsToShow.map((col: string, colIdx: number) => (
                  <td key={colIdx} className="ctable-cell">{row[col]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ---------------- BAR CHART ----------------
function PlotBarChart({ dataSet }: { dataSet: any[] }) {
  const [graphCount, setGraphCount] = useState(1);

  const [graphs, setGraphs] = useState(() =>
    Array.from({ length: 1 }).map(() => ({
      selectedColumn: Object.keys(dataSet[0] || {})[1] || "",
      selectedItems: [],
      openColumnDropdown: false,
      openItemsDropdown: false,
    }))
  );

  const [loadingGraphs, setLoadingGraphs] = useState<boolean[]>([false]);

  const columns = Object.keys(dataSet[0] || {});
  const nameList: string[] = dataSet.map((row) => row.Name);

  // -----------------------------
  // Resize graph arrays when graphCount changes
  // -----------------------------
  useEffect(() => {
    // Resize graphs[]
    setGraphs((prev) => {
      const arr = [...prev];

      while (arr.length < graphCount) {
        arr.push({
          selectedColumn: columns[1] || "",
          selectedItems: [],
          openColumnDropdown: false,
          openItemsDropdown: false,
        });
      }
      while (arr.length > graphCount) arr.splice(graphCount);

      return arr;
    });

    // Resize loadingGraphs[]
    setLoadingGraphs((prev) => {
      const arr = [...prev];

      while (arr.length < graphCount) arr.push(false);
      while (arr.length > graphCount) arr.splice(graphCount);

      return arr;
    });
  }, [graphCount]);

  // -----------------------------
  // Update helper
  // -----------------------------
  const updateGraph = (index: number, updates: any) => {
    setGraphs((prev) => {
      const arr = [...prev];
      arr[index] = { ...arr[index], ...updates };
      return arr;
    });
  };

  // -----------------------------
  // Update with loading overlay
  // -----------------------------
  const handleUpdateWithLoading = (index: number, updates: any) => {
    setLoadingGraphs((prev) => {
      const arr = [...prev];
      arr[index] = true;
      return arr;
    });

    setTimeout(() => {
      updateGraph(index, updates);

      setLoadingGraphs((prev) => {
        const arr = [...prev];
        arr[index] = false;
        return arr;
      });
    }, 200);
  };

  // -----------------------------
  // Legend renderer
  // -----------------------------
  const renderLegend = (transformed: any[]) => {
    const MAX_ROWS = 3;
    const ROW_HEIGHT = 15;

    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          maxHeight: `${MAX_ROWS * ROW_HEIGHT}px`,
          overflow: "hidden",
          marginTop: "0.75rem",
        }}
      >
        {transformed.map((row, idx) => (
          <span
            key={`${row.Name}-${idx}`}
            style={{
              fontSize: 12,
              color: colorList[idx % colorList.length],
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              maxWidth: 120,
            }}
          >
            {row.Name}
          </span>
        ))}
      </div>
    );
  };

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <div className="barGraph-container">
      {/* ADD / REMOVE BUTTONS */}
      <div className="addGraph-btnbox">
        <span>Add/Remove Chart</span>
        <button onClick={() => setGraphCount((prev) => prev + 1)}>+</button>
        <span>{graphCount}</span>
        <button onClick={() => setGraphCount((prev) => (prev > 1 ? prev - 1 : 1))}>
          -
        </button>
      </div>

      {/* RENDER EACH BAR CHART */}
      {graphs.map((graph, i) => {
        if (!graph.selectedColumn) return null;

        const itemsToPlot =
          graph.selectedItems.length > 0 ? graph.selectedItems : nameList;

        // Transform data
        const transformed = dataSet
          .filter((row) => itemsToPlot.includes(row.Name))
          .map((row) => {
            // match column ignoring case
            const actualKey = columns.find(
              (c) => c.toLowerCase() === graph.selectedColumn.toLowerCase()
            );

            return {
              Name: row.Name,
              [graph.selectedColumn]: actualKey ? row[actualKey] : 0,
            };
          });

        return (
          <div key={`graph-${i}`} className="barGraph-box">
            {/* LOADING OVERLAY */}
            {loadingGraphs[i] && (
              <div className="loading-overlay">Loading...</div>
            )}

            {/* HEADER */}
            <div className="barChart-header">
              <Dropdown
                label="Column"
                items={columns}
                id={`column-${i}`}
                openId={graph.openColumnDropdown ? `column-${i}` : null}
                setOpenId={(val) =>
                  updateGraph(i, { openColumnDropdown: val === `column-${i}` })
                }
                selectedItems={[graph.selectedColumn]}
                setSelectedItems={(arr) =>
                  handleUpdateWithLoading(i, { selectedColumn: arr[0] })
                }
                multiSelect={false}
              />

              <Dropdown
                label="Items"
                items={nameList}
                id={`items-${i}`}
                openId={graph.openItemsDropdown ? `items-${i}` : null}
                setOpenId={(val) =>
                  updateGraph(i, { openItemsDropdown: val === `items-${i}` })
                }
                selectedItems={graph.selectedItems}
                setSelectedItems={(arr) =>
                  handleUpdateWithLoading(i, { selectedItems: arr })
                }
                multiSelect={true}
              />

              <h2>{graph.selectedColumn} Bar Chart</h2>
            </div>

            {/* BAR CHART */}
            <BarChart
              data={transformed}
              style={{ width: "100%", height: "100%", aspectRatio:"16/9" }}
            >
              <XAxis dataKey="Name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Legend content={() => renderLegend(transformed)} />

              <Bar dataKey={graph.selectedColumn}>
                {transformed.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={colorList[idx % colorList.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        );
      })}
    </div>
  );
}


// ---------------- PIE CHART ----------------
function PlotPieChart(){


  return (
    <div className="piechart-container">
      <h2>Not Implemented yet...</h2>
    </div>
  )
}


// ---------------- HISTOGRAM CHART ----------------
function PlotHistogram(){


  return (
    <div className="histogramchart-container">
      <h2>Not Implemented yet...</h2>
    </div>
  )
}


// ---------------- SCATTER CHART ----------------
function PlotScatterChart(){


  return (
    <div className="scatterchart-container">
      <h2>Not Implemented yet...</h2>
    </div>
  )
}


// ---------------- BOX CHART ----------------
function PlotBoxChart(){


  return (
    <div className="boxchart-container">
      <h2>Not Implemented yet...</h2>
    </div>
  )
}



// ---------------- MAIN ROUTER ----------------
function CustomPlots({ dataSet, selectedPlot = "Table" }: CustomPlotsProps) {
  if (!dataSet) return null;

  switch (selectedPlot) {
    case "Table":
      return <PlotTable dataSet={dataSet} />;

    case "Bar Chart":
      return <PlotBarChart dataSet={dataSet.data} />;

    case "Pie Chart":
      return <PlotPieChart />;

    case "Line Graph":
      return <PlotPieChart />;

    case "Histogram":
      return <PlotHistogram />;

    case "Scatter Chart":
      return <PlotScatterChart />;

    case "Box Chart":
      return <PlotBoxChart />;

    default:
      return null;
  }
}

export default CustomPlots;
