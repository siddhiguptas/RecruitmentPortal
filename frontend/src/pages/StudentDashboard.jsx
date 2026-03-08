import { Routes,Route } from "react-router-dom"
import Sidebar from "../components/Sidebar"

import ResumeUpload from "./ResumeUpload"
import RecommendedJobs from "./RecommendedJobs"
import ProctoredTest from "./ProctoredTest"

function StudentDashboard(){

return(

<div className="dashboard">

<Sidebar role="student"/>

<div className="content">

<Routes>

<Route path="resume" element={<ResumeUpload/>}/>
<Route path="recommended" element={<RecommendedJobs/>}/>
<Route path="test" element={<ProctoredTest/>}/>

</Routes>

</div>

</div>

)

}

export default StudentDashboard