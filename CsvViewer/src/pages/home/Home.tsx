import { useEffect, useRef, useState } from "react";
import MenuIcon from "../../assets/menu.svg";
import { PageRoutes, Porxy, type UploadData } from "../../Constants";
import Upload from "../../components/upload/Upload";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  // State
  const [dataDummy, setDataDummy] = useState<UploadData[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [openUpload, setOpenUpload] = useState<boolean>(false);
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  
  const [sortType, setSortType] = useState<"recent" | "az">(
    () => (localStorage.getItem("sortType") as "recent" | "az") || "recent"
  );
  const [selectedFiles, setSelectedFiles] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("selectedFiles") || "[]")
  );
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(
    () => JSON.parse(localStorage.getItem("selectedAuthors") || "[]")
  );

  // Dropdown & menu refs
  const dropdownRefs = {
    fileName: useRef<HTMLDivElement | null>(null),
    author: useRef<HTMLDivElement | null>(null),
  };


  // ---- Menu & dropdown handlers ----
  const handleMenuClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const rect = menuRefs.current[id]!.getBoundingClientRect();
    setMenuPosition({ x: rect.left, y: rect.bottom });
    setOpenMenuId(prev => (prev === id ? null : id));
  };


  const toggleDropdown = (name: string) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  const toggleCheck = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => (prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]));
  };

  const handleUpload = () => setOpenUpload(prev => !prev);


  const handleView = (id: string) => {
    const uploads: UploadData[] = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    const fileData = uploads.find(f => f.id === id);
    if (!fileData) return alert("File not found");

    // Navigate to the view page, passing id and filename
    const url = `${PageRoutes.viewplotspage.path}?id=${fileData.id}&filename=${fileData.fileName}`
    navigate(url);

    // console.log(url);
  };

  const handleConvertCSV = (id: string, targetType: string) => {
    const conversion: UploadData[] = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    const fileData = conversion.find(f => f.id === id);
    if (!fileData) return alert("File not found");

    const url = `${PageRoutes.waitingroompage.path}?id=${fileData.id}&filename=${fileData.fileName}&filetype=${targetType}`;
    window.open(`#${url}`, "_blank");
  };

  const handleDelete = async (id: string) => {
    const uploads: UploadData[] = JSON.parse(localStorage.getItem("uploadedFiles") || "[]");
    const fileData = uploads.find(f => f.id === id);
    if (!fileData) return;

    // Delete from backend
    await fetch(`${Porxy}/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fileData.id, filename: fileData.fileName }),
    });

    // Delete from localStorage
    const newUploads = uploads.filter(f => f.id !== id);
    localStorage.setItem("uploadedFiles", JSON.stringify(newUploads));
    setDataDummy(newUploads); // refresh table
  };


  // ---- Hover card logic ----
  useEffect(() => {
    const card = document.querySelector(".floating-card") as HTMLElement;
    const handler = (e: any) => {
      const cell = e.target.closest(".desc-cell");
      if (!cell) {
        card.style.display = "none";
        return;
      }
      card.innerText = cell.getAttribute("data-full")!;
      const rect = cell.getBoundingClientRect();
      const cardHeight = card.offsetHeight;
      const viewportHeight = window.innerHeight;
      let top = rect.bottom + 5;
      if (rect.bottom + cardHeight > viewportHeight) top = rect.top - cardHeight - 5;
      card.style.left = rect.left + "px";
      card.style.top = top + "px";
      card.style.display = "block";
    };
    document.addEventListener("mousemove", handler);
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  // ---- Click outside logic ----
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (openUpload && uploadRef.current && !uploadRef.current.contains(e.target as Node)) {
        setOpenUpload(false);
      }
      if (openMenuId !== null && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]!.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          if (openDropdown === key) setOpenDropdown(null);
        }
      });
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openDropdown, openMenuId, openUpload]);


  // ---- Load data from localStorage ----
  useEffect(() => {
    const localData = localStorage.getItem("uploadedFiles");
    if (!localData) return;
    setDataDummy(JSON.parse(localData));
  }, []);


  const handleNewUpload = (newData: UploadData) => {
    setDataDummy(prev => [...prev, newData]);
  };


  // ---- Unique files/authors ----
  const uniqueFileName = [...new Set(dataDummy.map(x => x.fileName))];
  const uniqueAuthors = [...new Set(dataDummy.map(x => x.author))];

  // ---- Filtering and sorting ----
  const parseDate = (d: string) => {
    const [m, day, y] = d.split("/").map(Number);
    return new Date(y, m - 1, day).getTime();
  };

  const filtered = dataDummy.filter(item => {
    const matchFile = selectedFiles.length === 0 || selectedFiles.includes(item.fileName);
    const matchAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(item.author);
    return matchFile && matchAuthor;
  });

  const finalList = [...filtered];
  if (sortType === "recent") finalList.sort((a, b) => parseDate(b.date) - parseDate(a.date));
  else if (sortType === "az") finalList.sort((a, b) => a.author.localeCompare(b.author));

  // ---- Persist dropdown & sort state ----
  useEffect(() => { localStorage.setItem("sortType", sortType); }, [sortType]);
  useEffect(() => { localStorage.setItem("selectedFiles", JSON.stringify(selectedFiles)); }, [selectedFiles]);
  useEffect(() => { localStorage.setItem("selectedAuthors", JSON.stringify(selectedAuthors)); }, [selectedAuthors]);

  return (
    <>
      <div className="project-container">
        <div className="container-header">
          <div className="container-headerLeft">
            {/* FILE NAME DROPDOWN */}
            <div ref={dropdownRefs.fileName} className={`selectionBox ${openDropdown === "fileName" ? "open" : ""} ${selectedFiles.length > 0 ? "active" : ""}`}>
              <button onClick={() => toggleDropdown("fileName")} className="dropdown-btn">File Name</button>
              <div className="dropdown-content">
                {uniqueFileName.map((file, i) => (
                  <label key={i} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedFiles.includes(file)} onChange={() => toggleCheck(file, setSelectedFiles)} />
                    <span>{file}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* AUTHOR DROPDOWN */}
            <div ref={dropdownRefs.author} className={`selectionBox ${openDropdown === "author" ? "open" : ""} ${selectedAuthors.length > 0 ? "active" : ""}`}>
              <button onClick={() => toggleDropdown("author")} className="dropdown-btn">Author</button>
              <div className="dropdown-content">
                {uniqueAuthors.map((author, i) => (
                  <label key={i} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedAuthors.includes(author)} onChange={() => toggleCheck(author, setSelectedAuthors)} />
                    <span>{author}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="fileCountBox"><p>{dataDummy.length} files uploaded...</p></div>
          </div>

          <div className="container-headerRight">
            <button className={sortType === "recent" ? "active" : ""} onClick={() => setSortType("recent")}>Recent</button>
            <button className={sortType === "az" ? "active" : ""} onClick={() => setSortType("az")}>A - Z</button>
            <button onClick={handleUpload}>Upload CSV</button>
          </div>
        </div>

        {/* TABLE */}
        <div className="container-body">
          <div className="container-table">
            <div className="table-row table-header">
              <div className="table-cell">File Name</div>
              <div className="table-cell">Description</div>
              <div className="table-cell">Author</div>
              <div className="table-cell">Date</div>
              <div className="table-cell">Actions</div>
            </div>

            <div className="table-body">
              {finalList.map(item => (
                <div className="table-row" key={item.id}>
                  <div className="table-cell">{item.fileName}</div>
                  <div className="table-cell desc-cell" data-full={item.description}>{item.description}</div>
                  <div className="table-cell">{item.author}</div>
                  <div className="table-cell">{item.date.split("T")[0]}</div>

                  <div className="table-cell actions">
                    <div className="actionsMenuIcon" ref={el => { menuRefs.current[item.id] = el; }} onClick={e => e.stopPropagation()}>
                      <button onClick={e => handleMenuClick(e, item.id)}><img src={MenuIcon} alt="menu" /></button>
                      {openMenuId === item.id && (
                        <div className="actionsBox" style={{ top: menuPosition.y - 73 + "px", left: menuPosition.x + 60 + "px" }}>
                          <button onClick={() => handleConvertCSV(item.id, "json")}>csv<span>2</span>Json</button>
                          <button onClick={() => handleView(item.id)}>View</button>
                          <button onClick={() => handleDelete(item.id)}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="floating-card"></div>
      </div>

      {openUpload && <Upload onClose={() => setOpenUpload(false)} onUpload={handleNewUpload} ref={uploadRef} />}
    </>
  );
}

export default Home;
