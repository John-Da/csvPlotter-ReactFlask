import { HashRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/navbar/NavBar";
import { PageRoutes } from "./Constants";
import { useEffect, useState } from "react";
import { Porxy } from "./Constants";
import './index.css'

function App() {

  const [readyStatus, setReadyStatus] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);
  const [animationState, setAnimationState] = useState("fade-in");

  useEffect(() => {
    async function wakeServer() {
      try {
        await fetch(`${Porxy}/ping`);
      } catch (e) {}
      finally {
        setReadyStatus(true);

        setTimeout(() => {
          setAnimationState("fade-up");
        }, 5000);

        setTimeout(() => {
          setHideOverlay(true);
        }, 6500);
      }
    }
    wakeServer();
  }, []);


  return (
    <>
    <Router>
      {!readyStatus && (
        <div className={`statusLoading-box ${animationState}`}>
          <div className="loading">
            <div className="loading-animation"></div>
            <span>Waking server...</span>
          </div>
        </div>
      )}

      {readyStatus && !hideOverlay && (
        <div className={`statusLoading-box done ${animationState}`}>
          <div className="checkmark">✓</div>
          <span>Ready!</span>
        </div>
      )}
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


