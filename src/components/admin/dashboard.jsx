import React, { useMemo, useState } from "react";
import Profile from "./profile";
import jobSpringLogo from "../../assets/jobspringt.png";

const INITIAL_JOBS = [
  { id: 1, title: "Frontend Engineer", company: "LHT Digital", status: "active" },
  { id: 2, title: "Backend Developer", company: "PMS API", status: "active" },
  { id: 3, title: "Mobile Engineer", company: "EDBPM Mobile", status: "active" },
];

export default function AdminDashboard() {
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("jobs");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return jobs.filter((j) => {
      const text = `${j.title} ${j.company} ${j.status}`.toLowerCase();
      const passKw = text.includes(kw);
      const passStatus = filter === "all" ? true : j.status === filter;
      return passKw && passStatus;
    });
  }, [jobs, q, filter]);

  const markInvalid = (id) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === id
          ? { ...j, status: j.status === "invalid" ? "active" : "invalid" }
          : j
      )
    );
  };

  const removeJob = (id) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  return (
    <div className="app-root">
      <nav className="nav" aria-label="Primary">
        <div className="nav-inner">
          <div className="brand">
            <img
              src={jobSpringLogo}
              alt="JobSpring Logo"
              style={{ width: "260px", height: "auto" }}
            />
            <div className="brand-title">JobPring Admin</div>
          </div>
          <div className="spacer" />
          <div className="tabs" role="tablist" aria-label="Main tabs">
            {[
              { key: "jobs", label: "Jobs" },
              { key: "profile", label: "Profile" },
            ].map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="container">
        <section className="toolbar" aria-label="Filters">
          <input
            className="input"
            placeholder="Search title / company / status"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select
            className="select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Status filter"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="invalid">Invalid</option>
          </select>
          <button className="btn ghost" onClick={() => { setQ(""); setFilter("all"); }}>
            Reset
          </button>
        </section>

        {activeTab === "jobs" ? (
          <main className="section" aria-label="Jobs list">
            <h2>Jobs</h2>
            <div className="muted" style={{ marginBottom: 8 }}>
              Showing {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </div>
            <div className="grid">
              {filtered.length === 0 && <div className="muted">No jobs found.</div>}
              {filtered.map((j) => (
                <article key={j.id} className="card" aria-label={`Job ${j.id}`}>
                  <div>
                    <div className="row">
                      <span className="name">{j.title}</span>
                      <span className="muted">@ {j.company}</span>
                    </div>
                    <div className="row" style={{ marginTop: 6 }}>
                      <span className={`pill ${j.status === "invalid" ? "invalid" : ""}`}>
                        status: {j.status}
                      </span>
                      <span className="pill">id: {j.id}</span>
                    </div>
                  </div>
                  <div className="actions">
                    <button className="btn danger" onClick={() => removeJob(j.id)}>delete</button>
                    <button className="btn warning" onClick={() => markInvalid(j.id)}>
                      {j.status === "invalid" ? "restore" : "invalid"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </main>
        ) : (
          <Profile />
        )}
        <style>{`
      
        *{box-sizing:border-box}
        html, body, #root { height: 100%; }
        body{ margin:0; background: var(--bg); color: var(--text);
              font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
        
        .nav-inner{
          max-width: 1100px;
          margin: 0 auto; padding: 12px 20px;
          display:flex; align-items:center; gap:16px;
        }
        .brand{
          display:flex; align-items:center; gap:10px; font-weight:800;
        }
        .logo{
          width:36px; height:36px; border-radius:10px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          display:grid; place-items:center; color:#064e3b; font-weight:900;
          box-shadow: var(--shadow);
        }
        .brand-title{ font-size: 18px; }

        .spacer{ flex:1; }

        .tabs{ display:flex; gap:8px; }
        .tab-btn{
          padding: 10px 14px; border-radius: 12px;
          border: 1px solid var(--border); background: transparent;
          color:#334155; cursor:pointer;
        }
        .tab-btn:hover{ border-color: rgba(34,197,94,.45); color:#111827; }
        .tab-btn.active{
          background: rgba(34,197,94,.12);
          border-color: rgba(34,197,94,.45);
          color:#065f46;
          box-shadow: var(--ring);
        }

        
        .container{ max-width:1100px; margin: 0 auto; padding: 18px 20px; }

        .toolbar{
          margin: 18px 0; display:flex; gap:10px; flex-wrap: wrap;
          align-items: center;
        }
        .input{
          flex: 2 1 520px;                
          height: 46px; 
          padding: 0 14px; 
          border-radius: 12px;
          border: 1px solid var(--border); 
          background: #fff; 
          color: var(--text);
        }
        .input::placeholder{ color:#9aa3af; }
        .input:focus{ outline:none; border-color: rgba(34,197,94,.55); box-shadow: var(--ring); }

        .select{
          flex: 0 0 180px;
          height: 46px; padding: 0 12px; border-radius: 12px;
          border: 1px solid var(--border); background: #fff; color: var(--text);
        }

        .btn{
          height: 46px; padding: 0 16px; border-radius: 12px; border: 0;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color:#042f2e; font-weight:800; cursor: pointer;
        }
        .btn:disabled{ opacity:.6; cursor: not-allowed; }

        .ghost{
          background: #fff; border:1px solid var(--border); color:#0f172a;
        }
        .ghost:hover{ border-color: rgba(34,197,94,.45); }

        .section{
          width: 100%;
          background: var(--section);
          margin: 0;
          padding: 24px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }
        .section h2{
          margin: 0 0 15px;
          color: var(--text);
          font-weight: 700; font-size: 1.5rem;
        }
        .muted{ color: var(--muted); font-size: 14px; }

        .grid{
          display:grid; gap: 14px; isolation: isolate;
          grid-template-columns: repeat(1, minmax(0,1fr));
        }
        @media (min-width: 720px){ .grid{ grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (min-width: 1280px){ .grid{ grid-template-columns: repeat(3, minmax(0,1fr)); } }

        .card{
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 12px;
          display: grid; grid-template-columns: 1fr auto;
          gap: 10px; align-items: center;
          box-shadow: var(--shadow);
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
        }
        .card:hover{
          transform: translateY(-2px);
          border-color: rgba(34,197,94,.35);
          box-shadow: 0 10px 28px rgba(0,0,0,.10);
        }

        .row{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
        .name{ font-weight: 800; }
        .pill{
          font-size:12px; padding:6px 8px; border-radius:999px;
          border:1px solid var(--border); color:#334155; background:#fff;
        }
        .pill.invalid{
          border-color: rgba(248,113,113,.45);
          color:#991b1b; background: #fff1f2;
        }

        .actions{ display:flex; gap:8px; }
        .danger{ background:#ef4444; color:#0b1220; font-weight:800; }
        .warning{ background:#f59e0b; color:#0b1220; font-weight:800; }
      `}</style>

      </div>
    </div>

  );

}
