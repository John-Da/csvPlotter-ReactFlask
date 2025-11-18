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
        <Route path={PageRoutes.downloadpage.path} Component={PageRoutes.downloadpage.component} />
      </Routes>
    </Router>
    </>
  );
}

export default App;


