import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import { PageRoutes } from "./Constants";

function App() {
  return (
    <>
    <Router>
      <NavBar />
      <Routes>
        <Route path={PageRoutes.homepage.path} Component={PageRoutes.homepage.component} />
        <Route path={PageRoutes.viewplotspage.path} Component={PageRoutes.viewplotspage.component} />
        <Route path={PageRoutes.waitingroompage.path} Component={PageRoutes.waitingroompage.component} />
      </Routes>
      <div style={{
        width:"100%", height:"2.5rem", display:"flex", 
        alignItems:"center", justifyContent:'center',
        fontWeight:"200", fontSize:"0.85rem", color:"var(--color-five)",
        background:"var(--color-eleven)"
      }}>
        <p>Copyright © 2025 | csvViewer by John Da. All Rights Reserved</p>
      </div>
    </Router>
    </>
  );
}

export default App;


