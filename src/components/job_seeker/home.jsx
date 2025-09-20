import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import jobSpringLogo from "../../assets/jobspringt.png";
import axios from 'axios';
import {NavLink, useNavigate} from "react-router-dom";
import api from "../../services/api.js";
import {FaStar} from "react-icons/fa";
import {logout} from "../../services/authService";


export default function Home() {
  console.log('[Home] render');
  const [isAuthed, setIsAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [q, setq] = useState("");
  const [t, sett] = useState("all");
  const [type, setType] = useState("all");
  //const [loading, setLoading] = useState(true);
  const [JobPosition, setJobPosition] = useState([]);
  //const token =  "";
  const navigate = useNavigate();

  //  useEffect(() => {
  //  checklogin();
  // }, []);

  useEffect(() => {
    checklogin();
    fetchJobPosition();
  }, []);

  const logoutt = async () => {
    logout();
    window.location.reload();
  };

    const checklogin = async () => {
    if (!localStorage.getItem("jobspring_token")) {
      setIsAuthed(false);
    }
    else{setIsAuthed(true);}
  };

  const fetchJobPosition = async () => {
    try {
      const response = await api.get('/api/job_seeker/job_list');
      setJobPosition(response.data.content);
    } catch (error) {
      console.error('Error fetching JobPosition:', error);
    } finally {
      // setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    console.log('[Home] compute filtered', { len: (JobPosition || []).length, query, type });
    const q = query.trim().toLowerCase();
    return (JobPosition ?? []).filter((j) => {
      const hay = `${j.title ?? ''} ${j.company ?? ''} ${j.location ?? ''} ${(j.tags ?? []).join(' ')}`.toLowerCase();
      const inText = q ? hay.includes(q) : true;
      const t = (j.employmentType ?? '').toString().toLowerCase();
      const typeOK = type === 'all' ? true : t === type;

      return inText && typeOK;
    });
  }, [JobPosition, q, t]);

  const handleSearch = async () => {
    setq(query.trim());
    sett(type);
    if (!query.trim()) {
      fetchJobPosition();
      return;
    }
    // setLoading(true);
    try {
      const res = await axios.get("/api/job_seeker/job_list/search", {
        params: { keyword: query, page: 0, size: 50 },
      });
      let list = res.data.content ?? [];
      if (type && type !== "all") {
        list = list.filter((j) => {
          const t = (j.employmentType ?? "").toLowerCase();
          return t === type.toLowerCase();
        });
      }
      setJobPosition(list);
    } catch (e) {
      console.error("Error searching jobs:", e);
    } finally {
      //  setLoading(false);
    }
  };

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
            {(isAuthed
          ? [
              { key: "home", label: "Home", to: "/home" },
              { key: "community", label: "Community", to: "/community" },
              { key: "profile", label: "Profile", to: "/profile" },
              { key: "logout", label: "logout", action: "logoutt" },
            ]
          : [
              { key: "home", label: "Home", to: "/home" },
              { key: "community", label: "Community", to: "/community" },
              { key: "login", label: "Login", to: "/auth/login" },
              { key: "register", label: "Register", to: "/auth/register" },
            ]).map((t) =>  t.action === "logoutt" ?(
              <button
              key={t.key}
              type="button"
              className="tab-btn"
              onClick={() => logoutt()}        
            >
              {t.label}
            </button>
          ) : (
            <NavLink
              key={t.key}
              to={t.to}
              className={({ isActive }) => `tab-btn ${isActive ? "active" : ""}`}
            >
              {t.label}
            </NavLink>
          ))}
          </div>
        </div>
      </nav>

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
            <button className="btn" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>
      </header>

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
                {/* <span className="chip">{j.type}</span> */}
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
                <button
                    className="btn"
                    onClick={() => navigate(`/jobs/${j.id}`)}   // 跳转详情页
                >
                  Apply
                </button>
                <button
                    className="tab-btn ghost"
                    onClick={() => alert(`Saved: ${j.title}`)}
                    style={{color: "#fbbf24", fontSize: "20px"}}  // 收藏图标
                >
                  <FaStar/>
                </button>

              </div>
              <div className="muted" style={{fontSize: 12}}>Posted on {j.postedAt}</div>
            </article>
          ))}
        </div>
      </main>
      <style>{`
        *{box-sizing:border-box}
       
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

        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:8px}
      `}</style>

      <footer className="section" style={{ paddingBottom: 40 }}>
        <div className="muted">© {new Date().getFullYear()} MySite. All rights reserved.</div>
      </footer>
    </div>
  );
}
