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
  const [graphs, setGraphs] = useState<any[]>([]);
  const [loadingGraphs, setLoadingGraphs] = useState<boolean[]>([false]);

  // Initialize graphs
  useEffect(() => {
    setGraphs((prev) => {
      const newGraphs = [...prev];
      while (newGraphs.length < graphCount) {
        newGraphs.push({
          selectedColumn: Object.keys(dataSet[0] || {})[1] || "",
          selectedItems: [],
          openColumnDropdown: false,
          openItemsDropdown: false,
        });
      }
      while (newGraphs.length > graphCount) newGraphs.pop();
      return newGraphs;
    });

    setLoadingGraphs((prev) => {
      const newArr = [...prev];
      while (newArr.length < graphCount) newArr.push(false);
      while (newArr.length > graphCount) newArr.pop();
      return newArr;
    });
  }, [graphCount, dataSet]);

  const addGraph = () => setGraphCount((prev) => prev + 1);

  const removeGraph = () =>
    setGraphCount((prev) => (prev > 1 ? prev - 1 : 1));
  

  const nameList: string[] = dataSet.map((row) => row.Name);

  const updateGraph = (index: number, updates: any) => {
    setGraphs((prev) => {
      const g = [...prev];
      g[index] = { ...g[index], ...updates };
      return g;
    });
  };

  const handleUpdateWithLoading = (index: number, updates: any) => {
    setLoadingGraphs((prev) => {
      const l = [...prev];
      l[index] = true;
      return l;
    });

    setTimeout(() => {
      updateGraph(index, updates);
      setLoadingGraphs((prev) => {
        const l = [...prev];
        l[index] = false;
        return l;
      });
    }, 200);
  };

  const renderLegend = (transformed: any[]) => {
    const MAX_LEGEND_ROWS = 3;
    const ROW_HEIGHT = 15;
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          maxHeight: `${MAX_LEGEND_ROWS * ROW_HEIGHT}px`,
          overflow: "hidden",
          marginTop: "0.75rem"
        }}
      >
        {transformed.map((row, idx) => (
          <span
            key={`${row.Name}-${idx}`}
            style={{
              fontSize: 12,
              color: colorList[idx % colorList.length],
              maxWidth: 100,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={row.Name}
          >
            {row.Name}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="barGraph-container">
      <div className="addGraph-btnbox">
        <button onClick={() => setGraphCount((prev) => prev + 1)}>+</button>
        <span>{graphCount}</span>
        <button onClick={() => setGraphCount((prev) => (prev > 1 ? prev - 1 : 1))}>-</button>
      </div>

      {graphs.map((graph, i) => {
        if (!graph.selectedColumn) return null;

        const itemsToPlot =
          graph.selectedItems.length > 0 ? graph.selectedItems : [...new Set(nameList)];

        const transformed = dataSet
          .filter((row) => itemsToPlot.includes(row.Name))
          .map((row) => {
            const colKey = Object.keys(row).find(
              (k) => k.toLowerCase() === graph.selectedColumn.toLowerCase()
            );
            return {
              Name: row.Name,
              [graph.selectedColumn]: colKey ? row[colKey] : 0,
            };
          });

        return (
          <div key={`graph-${i}`} className="graphBox" style={{ position: "relative" }}>
            {loadingGraphs[i] && (
              <div className="loading-overlay" >
                Loading...
              </div>
            )}

            <div className="barChart-header">
              <Dropdown
                label="Column"
                items={Object.keys(dataSet[0] || {})}
                id={`columns-${i}`}
                openId={graph.openColumnDropdown ? `columns-${i}` : null}
                setOpenId={(val) => updateGraph(i, { openColumnDropdown: val === `columns-${i}` })}
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
                setOpenId={(val) => updateGraph(i, { openItemsDropdown: val === `items-${i}` })}
                selectedItems={graph.selectedItems}
                setSelectedItems={(arr) => handleUpdateWithLoading(i, { selectedItems: arr })}
                multiSelect={true}
              />

              <h2>{graph.selectedColumn}</h2>
            </div>

            <BarChart style={{ maxWidth: "100%", maxHeight: "100%" }} data={transformed}>
              <XAxis dataKey="Name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Legend content={() => renderLegend(transformed)} />
              <Bar dataKey={graph.selectedColumn} name={graph.selectedColumn}>
                {transformed.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={colorList[idx % colorList.length]} />
                ))}
              </Bar>
            </BarChart>
          </div>
        );
      })}
    </div>
  );
}



// --- Placeholder Components ---
function Placeholder(props: any) {
  return (
    <div className="pieChart-container">
      {[...Array(props.graphCount)].map((_, i) => (
        <p key={i}>{JSON.stringify(props)}</p>
      ))}
    </div>
  );
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
      return <Placeholder dataSet={dataSet.data} />;

    case "Line Graph":
      return <Placeholder dataSet={dataSet.data} />;

    case "Histogram":
      return <Placeholder dataSet={dataSet.data} />;

    case "Scatter Chart":
      return <Placeholder dataSet={dataSet.data} />;

    case "Box Chart":
      return <Placeholder dataSet={dataSet.data} />;

    default:
      return null;
  }
}

export default CustomPlots;
