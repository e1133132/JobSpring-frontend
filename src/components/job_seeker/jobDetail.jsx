import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../App.css";
import api from "../../services/api.js";
import { getCurrentUser } from "../../services/authService";
import Navigation from "../navigation.jsx";

export default function JobDetail() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [role, setRole] = useState(getCurrentUser() ? getCurrentUser().role : 'guest');
    const [name, setName] = useState(getCurrentUser() ? getCurrentUser().fullName : 'guest');

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get('/api/job_seeker/job_list');
                const jobs = response.data.content;
                const found = jobs.find((j) => String(j.id) === String(id));
                setJob(found);
            } catch (error) {
                console.error("Failed to fetch job:", error);
            }
        };
        fetchJob();
    }, [id]);


    if (!job) return <div className="section">Job not found.</div>;

    const rawType = job.employment_type || job.employmentType;

    const typeMap = {
        1: "Full-time",
        2: "Internship",
        3: "Contract",
    };

    const typeText = typeMap[rawType] || rawType || "N/A";

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        try {
            return new Date(dateStr).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            });
        } catch {
            return dateStr;
        }
    };

    const handleApply = () => {
        alert("Apply success!");

        // TODO: 这里预留提交逻辑
        // axios.post("/api/job/apply", { jobId: job.id, userId: ... })
        //   .then(() => alert("Apply success!"))
        //   .catch(err => console.error("Apply failed:", err));
    };

    return (
        <div className="app-root">
            <Navigation role={role} username={name} />

            <main
                className="section"
                style={{
                    display: "flex",
                    gap: "24px",
                    marginTop: "20px",
                    padding: "20px",
                    maxWidth: "1200px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    boxSizing: "border-box",
                    flexWrap: "wrap"
                }}
            >
                {/* 左边 */}
                <div style={{ flex: "2 1 600px", minWidth: "300px" }}>
                    <article className="card" style={{ padding: "24px" }}>
                        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "12px" }}>
                            {job.title}
                        </h1>
                        <div className="muted" style={{ marginBottom: "20px" }}>
                            <span style={{ fontWeight: 600, color: "#16a34a" }}>
                                {job.salaryMin ? job.salaryMin : "N/A"} - {job.salaryMax ? job.salaryMax : "N/A"} SGD
                            </span>
                            {" · "}
                            {job.location || "N/A"} {" · "}
                            {typeText} {" · "}
                            Posted at {formatDate(job.postedAt)}
                        </div>

                        <h3 style={{ marginBottom: "10px" }}>Job Description</h3>
                        <p style={{ lineHeight: 1.6, color: "#333" }}>{job.description}</p>

                        <div className="cta" style={{ marginTop: "20px" }}>
                            <button className="btn" onClick={handleApply}>Apply Now</button>
                        </div>
                    </article>
                </div>

                {/* 右边 */}
                <div style={{ flex: "1 1 300px", minWidth: "260px" }}>
                    <article className="card" style={{ padding: "20px" }}>
                        <h3 style={{ marginBottom: "10px" }}>Company Info</h3>
                        <p style={{ fontWeight: 600 }}>Name:{job.company}</p>
                        <p className="muted">Location: {job.location}</p>
                    </article>
                </div>
            </main>

            <style>{`
        *{box-sizing:border-box}

        .logo{display:flex; align-items:center; gap:10px}
        .logo-mark{width:36px; height:36px; border-radius:10px;
         background:linear-gradient(135deg,var(--accent),var(--accent-2));
          display:grid; place-items:center; box-shadow:var(--shadow)}
        .logo-mark span{font-weight:800; color:#0b1220}
        .brand{font-weight:700; letter-spacing:.3px}
        .spacer{flex:1}
        .tabs{display:flex; gap:10px}
        .tab-btn{
            padding:10px 14px; border-radius:12px;
            border:1px solid var(--border);
            color:#334155;font-weight: 600; background: transparent; cursor:pointer;
        }
        .tab-btn:hover{
            border-color: rgba(34,197,94,.45); color:#111827;
        }
        .tab-btn.active{
            background: rgba(34,197,94,.12);
            border-color: rgba(34,197,94,.45);
            color:#065f46;
            box-shadow: var(--ring);
        }
        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:12px}
               
        .app-root {
            background: #fffcf5;
            min-height: 100vh;
        }
      `}</style>

            <footer className="section" style={{ paddingBottom: 40, textAlign: "center" }}>
                <div className="muted">© {new Date().getFullYear()} MySite. All rights reserved.</div>
            </footer>
        </div>
    );
}
