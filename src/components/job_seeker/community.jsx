import React, { useEffect, useMemo, useState } from "react";
import "../../App.css";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../services/authService";
import Navigation from "../navigation.jsx";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [role,] = useState(getCurrentUser() ? getCurrentUser().role : 'guest');
  const [name, ] = useState(getCurrentUser() ? getCurrentUser().fullName : 'guest');


  useEffect(() => {
    checklogin();
  }, []);


  const checklogin = async () => {
    if (!localStorage.getItem("jobspring_token")) {
      setIsAuthed(false);
    }
    else { setIsAuthed(true); }
  };
  useEffect(() => {
    loadPosts();
  }, []);

  const normalize = (arr) =>
    arr.map((p, i) => ({
      id: p.id ?? `${Date.now()}-${i}`,
      title: p.title ?? p.subject ?? "Untitled",
      content: p.content ?? p.body ?? "",
      author: p.author ?? p.user ?? "Anonymous",
      createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
    }));

  async function loadPosts() {
    try {
      const res = await axios.get("/api/community/posts");
      const arr = Array.isArray(res.data) ? res.data : res.data?.items ?? [];
      const norm = normalize(arr);
      setPosts(norm);
      localStorage.setItem("jobspring_posts", JSON.stringify(norm));
    } catch {
      const cached = localStorage.getItem("jobspring_posts");
      if (cached) {
        setPosts(JSON.parse(cached));
      } else {
        const seed = normalize([
          {
            id: 1,
            title: "Welcome!",
            content: "Say hi and share interview tips.",
            author: "System",
            createdAt: new Date().toISOString(),
          },
        ]);
        setPosts(seed);
        localStorage.setItem("jobspring_posts", JSON.stringify(seed));
      }
    }
  }

  const ordered = useMemo(
    () =>
      [...posts].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
    [posts]
  );

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso ?? "";
    }
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    setSubmitting(true);
    const draft = {
      id: `local-${Date.now()}`,
      title: form.title.trim(),
      content: form.content.trim(),
      author: "Me",
      createdAt: new Date().toISOString(),
    };

    try {
      const token = localStorage.getItem("jobspring_token");
      const res = await axios.post("/api/community/posts", draft, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const saved = res?.data ?? draft;
      const next = [saved, ...posts];
      setPosts(next);
      localStorage.setItem("jobspring_posts", JSON.stringify(next));
      setForm({ title: "", content: "" });
    } catch {
      const next = [draft, ...posts];
      setPosts(next);
      localStorage.setItem("jobspring_posts", JSON.stringify(next));
      setForm({ title: "", content: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-root">
      <Navigation role={role} username={name} />
      <p className="subheading1">Community</p>
      <main className="section" style={{ marginTop: "0px" }}>
        {!isAuthed && (
          <div className="notice">
            You need to <NavLink to="/auth/login">login</NavLink> to post.
          </div>
        )}

        <form className="card post-form" onSubmit={onSubmit}>
          <input
            className="input"
            placeholder="Post title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <textarea
            className="textarea"
            rows={4}
            placeholder="Write something helpful…"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
          <div className="actions">
            <button
              className="btn"
              type="submit"
              disabled={
                !isAuthed ||
                submitting ||
                !form.title.trim() ||
                !form.content.trim()
              }
            >
              {submitting ? "Posting…" : "Post"}
            </button>
          </div>
        </form>

        <div className="posts">
          {ordered.length === 0 ? (
            <div className="empty">No posts yet.</div>
          ) : (
            ordered.map((p) => (
              <article key={p.id} className="post">
                <h3 className="post-title">{p.title}</h3>
                <div className="post-meta">
                  <span className="author">{p.author}</span>
                  <span className="dot">•</span>
                  <span className="date">{formatDate(p.createdAt)}</span>
                </div>
                <p className="post-content">{p.content}</p>
              </article>
            ))
          )}

        </div>
      </main>

      <style>{`
        *{box-sizing:border-box}
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; margin-bottom:16px; }
        .input, .textarea { width:100%; border:1px solid #e5e7eb; border-radius:12px; padding:10px 12px; font-size:14px; outline:none; margin-bottom:10px; }
        .input:focus, .textarea:focus { border-color:#86efac; box-shadow:0 0 0 3px rgba(16,185,129,.15); }
        .actions { display:flex; justify-content:flex-end; }
         
         color:#fff; 
         box-shadow:var(--ring)}

        .muted{color:var(--muted); font-size:14px}
        .cta{margin-top:auto; display:flex; gap:8px}
        .posts { display:grid; gap:12px; }
        .post { background:#fafafa; border:1px solid #e5e7eb; border-radius:12px; padding:14px; }
        .post-title{ margin:0 0 6px; color:#111827; }
        .post-meta{ color:#6b7280; font-size:13px; display:flex; align-items:center; gap:6px; margin-bottom:8px; }
        .dot{opacity:.6;}
        .post-content{ white-space:pre-wrap; margin:0; color:#334155; }

        .subheading-underline{ margin: 8px 0 16px; font-size:18px; font-weight:800; color:#0f172a; position:relative; }
        .subheading-underline::after{ content:""; position:absolute; left:0; bottom:-6px; width:56px; height:3px; border-radius:3px; background: linear-gradient(90deg,#34d399,#22c55e);}
      `}</style>
    </div>
  );
}
