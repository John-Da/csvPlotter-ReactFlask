import "../../index.css"
import "./Waitingroom.css"


function WaitingRoom() {
  return (
    <div className="empty-container">
        <div className="empty-topbox">
            <h1>Converting CSV to Json</h1>
        </div>
        <div className="empty-bottombox">
            <div className="progresstxt-box">
                <span>Please wait...</span>
                <span>100%</span>
            </div>
            <div className="progressbar-box">
                <div className="progressbar"></div>
            </div>
        </div>
    </div>
  )
}

export default WaitingRoom