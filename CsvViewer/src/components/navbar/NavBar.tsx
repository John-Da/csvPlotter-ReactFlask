import { PageRoutes } from "../../Constants"
import "../../index.css"
import "./NavBar.css"

function NavBar() {
  return (
    <nav>
        <div className="navRight">
          <a href={PageRoutes.homepage.path} className="logo">@csvViewer</a>
        </div>
        <div className="navLeft">
          <a href="https://github.com/John-Da/csvPlotter-ReactFlask" target="_blank" className="linkto">GitHub</a>
        </div>
    </nav>
  )
}

export default NavBar