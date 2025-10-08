import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.js";
import Navigation from "../navigation.jsx";
import { getCurrentUser } from "../../services/authService";

function formatDate(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? "-" : d.toLocaleString();
}
function buildFileUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${window.location.origin}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ReviewDetail() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [role,] = useState(getCurrentUser() ? getCurrentUser().role : 'guest');
    const [name,] = useState(getCurrentUser() ? getCurrentUser().fullName : 'guest');


    const normalized = useMemo(() => {
        if (!data) return null;

        const get = (...keys) => {
            for (const k of keys) {
                if (k in data && data[k] != null && data[k] !== "") return data[k];
                if (Object.prototype.hasOwnProperty.call(data, k)) return data[k];
            }
            return null;
        };

        return {
            applicationId: get("application_id", "applicationId", "id"),
            title: get("title"),
            content: get("content", "review_content", "description"),
            rating: get("rating", "score"),
            status: get("status"),
            submittedAt: get("submitted_at", "submittedAt", "created_at"),
            reviewedBy: get("reviewed_by", "reviewedBy"),
            reviewNote: get("review note", "review_note", "reviewNote", "note"),
            publicAt: get("public at", "public_at", "publicAt", "published_at"),
            imageUrl: get("imageurl", "image_url", "imageUrl"),
        };
    }, [data]);

    useEffect(() => {
        let canceled = false;
        async function fetchDetail() {
            try {
                setLoading(true);
                setErr("");

                const res = await api.get("/api/admin/check_review");

                const payload = Array.isArray(res.data) ? res.data[0] : res.data;
                if (!payload) throw new Error("Empty response.");
                if (!canceled) setData(payload);
            } catch (e) {
                if (!canceled) setErr(e?.message || "Failed to load review.");
            } finally {
                if (!canceled) setLoading(false);
            }
        }
        fetchDetail();
        return () => {
            canceled = true;
        };
    }, []);

    if (loading) {
        return (
            <main className="section">
                <h2>Review Detail</h2>
                <div className="muted">Loading…</div>
            </main>
        );
    }

    if (err) {
        return (
            <main className="section">
                <h2>Review Detail</h2>
                <div className="error" role="alert">{err}</div>
                <button className="btn" onClick={() => navigate(-1)}>Back</button>
            </main>
        );
    }

    if (!normalized) {
        return (
            <main className="section">
                <h2>Review Detail</h2>
                <div className="muted">No data.</div>
                <button className="btn" onClick={() => navigate(-1)}>Back</button>
            </main>
        );
    }

    const {
        applicationId, title, content, rating, status,
        submittedAt, reviewedBy, reviewNote, publicAt, imageUrl
    } = normalized;

    return (
        <div className="app-root">
            <Navigation role={role} username={name} />
            <div className="header-row">
                <h2 style={{ margin: 0 }}>Review Detail</h2>
                <div className="spacer" />
                <button className="btn" onClick={() => navigate(-1)}>Back</button>
            </div>

            <article className="card" style={{ marginTop: 12 }}>
                <div className="grid-2">
                    <section>
                        <div className="field">
                            <div className="label">Application ID</div>
                            <div className="value">{applicationId ?? "-"}</div>
                        </div>
                        <div className="field">
                            <div className="label">Title</div>
                            <div className="value">{title ?? "-"}</div>
                        </div>
                        <div className="field">
                            <div className="label">Status</div>
                            <div className={`pill ${String(status || "").toLowerCase() || ""}`}>
                                {status ?? "-"}
                            </div>
                        </div>
                        <div className="field">
                            <div className="label">Rating</div>
                            <div className="value">{rating ?? "-"}</div>
                        </div>
                        <div className="field">
                            <div className="label">Submitted At</div>
                            <div className="value">{formatDate(submittedAt)}</div>
                        </div>
                        <div className="field">
                            <div className="label">Public At</div>
                            <div className="value">{formatDate(publicAt)}</div>
                        </div>
                        <div className="field">
                            <div className="label">Reviewed By</div>
                            <div className="value">{reviewedBy ?? "-"}</div>
                        </div>
                    </section>

                    <section>
                        <div className="field">
                            <div className="label">Content</div>
                            <div className="value prewrap">{content ?? "-"}</div>
                        </div>
                        <div className="field">
                            <div className="label">Review Note</div>
                            <div className="value prewrap">{reviewNote ?? "-"}</div>
                        </div>

                        {imageUrl && (
                            <div className="field" style={{ marginTop: 12 }}>
                                <div className="label">Attachment</div>
                                <img
                                    src={buildFileUrl(imageUrl)}
                                    alt="review attachment"
                                    style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--border,#e5e7eb)" }}
                                />
                            </div>
                        )}
                    </section>
                </div>
            </article>
        </div>
    );
}
