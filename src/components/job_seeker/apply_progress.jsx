
import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import jobSpringLogo from "../../assets/jobspringt.png";
import {NavLink} from "react-router-dom";
import {logout} from "../../services/authService";


const sampleApps = [
  { id: 1, title: "Frontend Engineer", company: "LHT Digital", status: "submitted", appliedAt: "2025-09-20T10:12:00Z" },
  { id: 2, title: "Backend Engineer", company: "ACME Corp", status: "viewed", appliedAt: "2025-09-19T09:01:00Z" },
  { id: 3, title: "Fullstack Developer", company: "TechFlow", status: "resume_passed", appliedAt: "2025-09-18T14:20:00Z" },
  { id: 4, title: "DevOps Engineer", company: "Cloudy", status: "submitted", appliedAt: "2025-09-17T08:30:00Z" },
];

const TABS = [
  { key: "submitted", label: "Submitted" },
  { key: "viewed", label: "Viewed" },
  { key: "resume_passed", label: "Resume Passed" },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso ?? "";
  }
}

export default function Apply_progress({ data = sampleApps }) {
  const [active, setActive] = useState("submitted");
  const [isAuthed, setIsAuthed] = useState(false);
    useEffect(() => {
      checklogin();
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

  // 防御：保证是数组，并按申请时间倒序
  const safeData = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return [...arr].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  }, [data]);

  // 各状态计数
  const counts = useMemo(() => {
    const c = { submitted: 0, viewed: 0, resume_passed: 0 };
    for (const it of safeData) {
     if (it?.status && (Object.hasOwn?.(c, it.status) || Object.prototype.hasOwnProperty.call(c, it.status))) {
     c[it.status]++;
}
    }
    return c;
  }, [safeData]);

  // 当前列表
  const currentList = useMemo(
    () => safeData.filter((it) => it?.status === active),
    [safeData, active]
  );

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
       <main className="section" style={{marginTop: "30px"}}>
      <div className="tabs" role="tablist" aria-label="Applications Status">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab-btn ${active === t.key ? "active" : ""}`}
            onClick={() => setActive(t.key)}
            role="tab"
            aria-selected={active === t.key}
          >
            {t.label}
            <span className="badge">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="list">
        {currentList.length === 0 ? (
          <div className="empty">No applications in this status.</div>
        ) : (
          currentList.map((it) => (
            <div key={it.id} className="app-card">
              <div className="app-title">{it.title}</div>
              <div className="app-meta">
                <span className="company">{it.company}</span>
                <span className="dot">•</span>
                <span className="date">{formatDate(it.appliedAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
</main>
      {/* 组件内样式：可拷到你的全局 CSS */}
      <style>{`
       *{box-sizing:border-box}
       
        .logo{display:flex; align-items:center; gap:10px}
        .logo-mark{width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--accent),var(--accent-2)); display:grid; place-items:center; box-shadow:var(--shadow)}
        .logo-mark span{font-weight:800; color:#0b1220}
        .brand{font-weight:700; letter-spacing:.3px}
        .spacer{flex:1}

         color:#fff; 
         box-shadow:var(--ring)}

        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:8px}

        .app-board { max-width: 860px; margin: 24px auto; padding: 16px; }
        .tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .tab-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 14px; border-radius: 12px; border: 1px solid #e5e7eb;
          background: #fff; color: #374151; cursor: pointer; font-weight: 600;
        }
        .tab-btn:hover { border-color: #a7f3d0; color: #111827; }
        .tab-btn.active {
          background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.45);
          color: #065f46; box-shadow: 0 0 0 3px rgba(16,185,129,.15);
        }
        .badge {
          display:inline-flex; align-items:center; justify-content:center;
          height: 22px; min-width: 22px; padding: 0 6px;
          border-radius: 999px; background: #111827; color: #fff; font-size: 12px;
        }
        .list { display: grid; gap: 12px; }
        .app-card {
          padding: 12px 14px; border: 1px solid #e5e7eb; border-radius: 12px;
          background: #fafafa;
        }
        .app-title { font-weight: 700; color: #111827; margin-bottom: 4px; }
        .app-meta { color: #6b7280; font-size: 14px; display: flex; align-items: center; gap: 6px; }
        .dot { opacity: .7; }
        .empty {
          padding: 24px; text-align: center; color: #6b7280;
          border: 1px dashed #e5e7eb; border-radius: 12px; background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
Apply_progress.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      title: PropTypes.string,
      company: PropTypes.string,
      status: PropTypes.oneOf(["submitted", "viewed", "resume_passed"]),
      appliedAt: PropTypes.string, // ISO string
    })
  ),
};
