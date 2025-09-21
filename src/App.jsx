import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Home from "./components/job_seeker/home";
import Profile from "./components/job_seeker/profile";
import React, {useEffect } from "react";
import AdminDashboard from "./components/admin/dashboard";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import JobDetail from "./components/job_seeker/jobDetail.jsx";
import Apply_progress from "./components/job_seeker/apply_progress.jsx";
import Community from "./components/job_seeker/community.jsx";

function App() {
    let r="";
       useEffect(() => {
        RoleDetect();
      }, []);
      const RoleDetect =async()=>{
    if(localStorage.getItem("jobspring_role")=="2")
     {r="/admin";}
    else{r="/home";}
  };
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to={r} replace/>}/>
                <Route path="/auth/login" element={<Login/>}/>
                <Route path="/home" element={<Home/>}/>
                <Route path="/community" element={<Community/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/profile/progress" element={<Apply_progress/>}/>
                <Route path="/admin" element={<AdminDashboard/>}/>
                <Route path="/auth/register" element={<Register/>}/>
                <Route path="/jobs/:id" element={<JobDetail/>} />
            </Routes>
        </Router>
    );
}

export default App;
