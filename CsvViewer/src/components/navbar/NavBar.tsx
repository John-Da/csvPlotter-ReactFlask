import "../../index.css"
import "./NavBar.css"

function NavBar() {
  return (
    <nav>
        <div className="navRight">
          <a href="/" className="logo">@csvViewer</a>
        </div>
        <div className="navLeft">
          <a href="/" className="linkto">GitHub</a>
        </div>
    </nav>
  )
}

export default NavBar