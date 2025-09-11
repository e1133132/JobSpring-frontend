import React, { useMemo, useState } from "react";
import '../App.css';
import jobSpringLogo from "../assets/jobspringt.png";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Frontend Engineer",
    company: "LHT Digital",
    location: "Singapore",
    type: "Full-time",
    tags: ["React", "TypeScript", "UI"],
    postedAt: "2025-09-03",
    description:
      "Build modern web interfaces and component libraries for logistics apps.",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "SimTech",
    location: "Singapore",
    type: "Contract",
    tags: ["ASP.NET", "SQL Server", "API"],
    postedAt: "2025-08-27",
    description:
      "Design resilient Web APIs, optimise SQL queries, integrate with mobile apps.",
  },
  {
    id: 3,
    title: "Mobile Engineer",
    company: "PMS Mobile Team",
    location: "Remote (Asia)",
    type: "Full-time",
    tags: ["React Native", "Expo", "Camera"],
    postedAt: "2025-08-20",
    description:
      "Implement signature capture, QR workflows, and offline-first features.",
  },
  {
    id: 4,
    title: "3D Graphics Developer",
    company: "LHT Labs",
    location: "Singapore",
    type: "Internship",
    tags: ["Three.js", "WebGL", "Konva"],
    postedAt: "2025-08-10",
    description:
      "Build pallet 2D/3D editors with scene tools and export pipelines.",
  },
];

export default function home() {
  const [active, setActive] = useState("home");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_JOBS.filter((j) => {
      const inText = (
        j.title + " " + j.company + " " + j.location + " " + j.tags.join(" ")
      )
        .toLowerCase()
        .includes(q);
      const typeOK = type === "all" ? true : j.type.toLowerCase() === type;
      return inText && typeOK;
    });
  }, [query, type]);

  return (
    <div className="app-root">

      <nav className="nav">
        <div className="nav-inner">
          <div className="logo">  
            <img
            src={jobSpringLogo}
            alt="JobSpring Logo"
            style={{ width: "260px", height: "auto" }}
          />
           
          </div>
          <div className="spacer" />
          <div className="tabs" role="tablist" aria-label="Primary">
            {[
              { key: "home", label: "Home" },
              { key: "community", label: "Community" },
              { key: "profile", label: "Profile" },
            ].map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={active === t.key}
                className={`tab-btn ${active === t.key ? "active" : ""}`}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 英雄图 + 搜索 */}
      <header className="hero" aria-label="Search jobs">
        <div className="hero-img">
          <div className="hero-overlay" />
          <div className="search-wrap">
            <input
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, companies, locations, or tags..."
              aria-label="Search"
            />
            <select
              className="select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Job type"
            >
              <option value="all">All types</option>
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            <button className="btn" onClick={() => { /* 可接后端搜索 */ }}>
              Search
            </button>
          </div>
        </div>
      </header>

      {/* 列表 */}
      <main className="section">
       <br></br> <h2>Jobs</h2>
        <div className="muted">
          Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
        <br></br>
        <div className="grid">
          {filtered.map((j) => (
            <article key={j.id} className="card" aria-label={`${j.title} at ${j.company}`}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700 }}>{j.title}</div>
                <span className="chip">{j.type}</span>
              </div>
              <div className="row" style={{ color: "black" }}>
                <span>{j.company}</span>
                <span> • </span>
                <span>{j.location}</span>
              </div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {j.tags.map((t) => (
                  <span key={t} className="chip" style={{ borderColor: "rgba(96,165,250,.35)", color: "#192534ff" }}>
                    {t}
                  </span>
                ))}
              </div>
              <p className="muted" style={{ margin: 0 }}>{j.description}</p>
              <div className="cta">
                <button className="btn" onClick={() => alert(`Apply: ${j.title}`)}>Apply</button>
                <button className="tab-btn ghost" onClick={() => alert(`Save: ${j.title}`)}>Save</button>
              </div>
              <div className="muted" style={{ fontSize: 12 }}>Posted on {j.postedAt}</div>
            </article>
          ))}
        </div>
      </main>
<style>{`
        *{box-sizing:border-box}
       
        /* 顶部导航 */
        .logo{display:flex; align-items:center; gap:10px}
        .logo-mark{width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--accent),var(--accent-2)); display:grid; place-items:center; box-shadow:var(--shadow)}
        .logo-mark span{font-weight:800; color:#0b1220}
        .brand{font-weight:700; letter-spacing:.3px}
        .spacer{flex:1}
        .tabs{display:flex; gap:10px}
        .tab-btn{
            padding:10px 14px; border-radius:12px;
            border:1px solid var(--border);
            color:#334155; background: transparent; cursor:pointer;
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
         color:#fff; 
         box-shadow:var(--ring)}

        /* 列表区 */
        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:8px}
      `}</style>

      <footer className="section" style={{paddingBottom:40}}>
        <div className="muted">© {new Date().getFullYear()} MySite. All rights reserved.</div>
      </footer>
    </div>
  );
}
