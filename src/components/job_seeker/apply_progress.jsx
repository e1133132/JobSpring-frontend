import React, { useMemo, useState, useEffect } from "react";
import "../../App.css";
import PropTypes from "prop-types";
import { getCurrentUser } from "../../services/authService";
import Navigation from "../navigation.jsx";


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
  { key: "saved", label: "saved" }
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
  const [role, setRole] = useState(getCurrentUser() ? getCurrentUser().role : 'guest');
  const [name, setName] = useState(getCurrentUser() ? getCurrentUser().fullName : 'guest');
  useEffect(() => {
    checklogin();
  }, []);

  const checklogin = async () => {
    if (!localStorage.getItem("jobspring_token")) {
      setIsAuthed(false);
    }
    else { setIsAuthed(true); }
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
      <Navigation role={role} username={name} />
      <p className="subheading">Application Progress and Saved</p>
      <main className="section" style={{ marginTop: "10px" }}>
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
      <style>{`
       *{box-sizing:border-box}

         box-shadow:var(--ring)}
        .app-board { max-width: 860px; margin: 24px auto; padding: 16px; }
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
