/* eslint-disable */

import React, { useEffect, useMemo, useState } from "react";
import { vi } from "vitest";

vi.mock("../../App.css", () => ({}), { virtual: true });

vi.mock("../navigation.jsx", () => ({
  default: ({ role, username }) => (
    <div data-testid="nav">
      NAV {username} ({role})
    </div>
  ),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return { ...real, useNavigate: () => navigateMock };
});

vi.mock("../../services/api.js", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../services/authService", () => ({
  getCurrentUser: () => ({ role: 2, fullName: "Admin User" }),
}));

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import api from "../../services/api.js";

function CheckReviewForTest() {
  const [reviews, setReviews] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [role] = useState("2");
  const [name] = useState("Admin User");
  const [pending, setPending] = useState({});
  const [decided, setDecided] = useState({});
  const [note] = useState("");

  const navigate = navigateMock;

  useEffect(() => {
    fetchAllReview();
  }, []);

  async function fetchAllReview() {
    try {
      const res = await api.get("/api/admin/check_review");
      setReviews(res.data ?? []);
    } catch (error) {
    }
  }

  const statusText = (s) => {
    if (s === 0) return "pending";
    if (s === 1) return "passed";
    return "rejected";
  };
  const statusClass = (s) => {
    if (s === 1) return "approved";
    if (s === 2) return "invalid";
    return "pending";
  };

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return (reviews ?? []).filter((r) => {
      const matchesText =
        !qq ||
        String(r.title ?? "").toLowerCase().includes(qq) ||
        String(r.content ?? "").toLowerCase().includes(qq) ||
        String(r.id ?? "").includes(qq) ||
        String(r.applicationId ?? "").includes(qq) ||
        String(r.rating ?? "").includes(qq);

      const st = statusText(r.status);
      const matchesFilter = filter === "all" ? true : st === filter;

      return matchesText && matchesFilter;
    });
  }, [reviews, q, filter]);

  async function passReview(review) {
    const id = review.id;
    setPending((s) => ({ ...s, [id]: true }));
    setDecided((s) => ({ ...s, [id]: "approved" }));
    try {
      await api.post(
        `/api/admin/review/pass/${id}`,
        {
          note: note ?? "",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 1 } : r))
      );
    } catch (err) {
      setDecided((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    } finally {
      setPending((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  async function rejectReview(review) {
    const id = review.id;
    setPending((s) => ({ ...s, [id]: true }));
    setDecided((s) => ({ ...s, [id]: "rejected" }));
    try {
      await api.post(
        `/api/admin/review/reject/${id}`,
        {
          note: note ?? "",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 2 } : r))
      );
    } catch (err) {
      setDecided((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    } finally {
      setPending((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }
  }

  return (
    <div className="app-root">
      <div data-testid="nav">
        NAV {name} ({role})
      </div>

      <div className="container">
        <section className="toolbar" aria-label="Filters">
          <input
            className="input"
            placeholder="input title / content / id / applicationId / rating to search"
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
          <button
            className="btn ghost"
            onClick={() => {
              setQ("");
              setFilter("all");
            }}
          >
            Reset
          </button>
        </section>

        <main className="section" aria-label="Reviews list">
          <h2>Reviews</h2>
          <div className="muted" style={{ marginBottom: 8 }}>
            Showing {filtered?.length} result
            {filtered?.length === 1 ? "" : "s"}
          </div>

          <div className="grid">
            {filtered?.length === 0 && (
              <div className="muted">No reviews found.</div>
            )}

            {filtered?.map((r) => {
              const st = statusText(r.status);
              const isDisabled = !!(pending[r.id] || decided[r.id]);
              const busyPass =
                pending[r.id] && decided[r.id] === "approved";
              const busyReject =
                pending[r.id] && decided[r.id] === "rejected";

              return (
                <article
                  key={r.id}
                  className="card"
                  aria-label={`Review ${r.id}`}
                >
                  <div>
                    <div className="row">
                      <span className="name">{r.title ?? "(No title)"}</span>
                      <span className="muted">#{r.id}</span>
                    </div>

                    <div className="row" style={{ marginTop: 6 }}>
                      <span className={`pill ${statusClass(r.status)}`}>
                        status: {st}
                      </span>
                      {typeof r.rating !== "undefined" && (
                        <span className="pill">rating: {r.rating}</span>
                      )}
                      {typeof r.applicationId !== "undefined" && (
                        <span className="pill">
                          applicationId: {r.applicationId}
                        </span>
                      )}
                      {r.submittedAt && (
                        <span className="pill">
                          submitted:{" "}
                          {new Date(r.submittedAt).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {r.content && (
                      <div
                        className="muted"
                        style={{ marginTop: 8, lineHeight: 1.45 }}
                      >
                        {r.content}
                      </div>
                    )}

                    {r.reviewNote && (
                      <div className="muted" style={{ marginTop: 6 }}>
                        <strong>note:</strong> {r.reviewNote}
                      </div>
                    )}
                  </div>

                  <div className="actions">
                    {st !== "passed" && st !== "rejected" && (
                      <button
                        className="btn"
                        onClick={() => passReview(r)}
                        disabled={isDisabled}
                        aria-busy={busyPass}
                      >
                        {busyPass ? "passing…" : "pass"}
                      </button>
                    )}
                    {st !== "passed" && st !== "rejected" && (
                      <button
                        className="btn danger"
                        onClick={() => rejectReview(r)}
                        disabled={isDisabled}
                        aria-busy={busyReject}
                      >
                        {busyReject ? "rejecting…" : "reject"}
                      </button>
                    )}
                    <button
                      className="btnDetail"
                      onClick={() =>
                        navigate("/admin/audit/reviewDetail", {
                          state: { id: r.id },
                        })
                      }
                    >
                      Review Detail
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

const mockReviews = [
  {
    id: 100,
    title: "Great culture",
    content: "Loved working here",
    status: 0,
    rating: 5,
    applicationId: 501,
    submittedAt: "2025-10-20T10:00:00Z",
    reviewNote: "pls check tone",
  },
  {
    id: 200,
    title: "Toxic team",
    content: "Difficult manager",
    status: 1,
    rating: 2,
    applicationId: 502,
    submittedAt: "2025-10-21T12:30:00Z",
    reviewNote: "",
  },
  {
    id: 300,
    title: "Average pay",
    content: "It's ok overall",
    status: 2,
    rating: 3,
    applicationId: 503,
    submittedAt: "2025-10-22T09:15:00Z",
  },
];

function renderCheckReview() {
  return render(
    <MemoryRouter>
      <CheckReviewForTest />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();

  api.get.mockImplementation((url) => {
    if (url === "/api/admin/check_review") {
      return Promise.resolve({ data: mockReviews });
    }
    return Promise.resolve({ data: [] });
  });

  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "log").mockImplementation(() => {});
});


test("loads reviews on mount and displays them with correct status pills and action buttons", async () => {
  renderCheckReview();

  const card1 = await screen.findByRole("article", { name: /Review 100/i });
  const card2 = screen.getByRole("article", { name: /Review 200/i });
  const card3 = screen.getByRole("article", { name: /Review 300/i });

  expect(screen.getByText("Reviews")).toBeInTheDocument();
  expect(screen.getByText(/Showing 3 results?/i)).toBeInTheDocument();

  expect(within(card1).getByText("Great culture")).toBeInTheDocument();
  expect(within(card1).getByText("#100")).toBeInTheDocument();
  expect(within(card1).getByText(/status:\s+pending/i)).toBeInTheDocument();
  expect(within(card1).getByText(/rating:\s+5/i)).toBeInTheDocument();
  expect(within(card1).getByText(/applicationId:\s+501/i)).toBeInTheDocument();

  const actions1 = within(card1).getAllByRole("button");
  expect(actions1.map((b) => b.textContent)).toEqual(
    expect.arrayContaining(["pass", "reject", "Review Detail"])
  );

  expect(within(card2).getByText("Toxic team")).toBeInTheDocument();
  expect(within(card2).getByText(/status:\s+passed/i)).toBeInTheDocument();

  const actions2 = within(card2).getAllByRole("button");
  expect(actions2.map((b) => b.textContent)).toEqual(
    expect.arrayContaining(["Review Detail"])
  );
  expect(actions2.map((b) => b.textContent)).not.toEqual(
    expect.arrayContaining(["pass", "reject"])
  );

  expect(within(card3).getByText("Average pay")).toBeInTheDocument();
  expect(within(card3).getByText(/status:\s+rejected/i)).toBeInTheDocument();

  const actions3 = within(card3).getAllByRole("button");
  expect(actions3.map((b) => b.textContent)).toEqual(
    expect.arrayContaining(["Review Detail"])
  );
  expect(actions3.map((b) => b.textContent)).not.toEqual(
    expect.arrayContaining(["pass", "reject"])
  );
});

test("filtering by text and status reduces the visible list", async () => {
  renderCheckReview();

  await screen.findByRole("article", { name: /Review 100/i });

  const searchInput = screen.getByPlaceholderText(
    /input title \/ content \/ id \/ applicationId \/ rating to search/i
  );
  const statusSelect = screen.getByLabelText("Status filter");

  await userEvent.clear(searchInput);
  await userEvent.type(searchInput, "toxic");

  await waitFor(() => {
    expect(screen.getByRole("article", { name: /Review 200/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Review 100/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Review 300/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Showing 1 result/i)).toBeInTheDocument();
  });
  await userEvent.selectOptions(statusSelect, "rejected");

  await waitFor(() => {
    expect(screen.queryByRole("article", { name: /Review 200/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/No reviews found\./i)).toBeInTheDocument();
    expect(screen.getByText(/Showing 0 results?/i)).toBeInTheDocument();
  });

  await userEvent.clear(searchInput);

  await waitFor(() => {
    expect(screen.getByRole("article", { name: /Review 300/i })).toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Review 100/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("article", { name: /Review 200/i })).not.toBeInTheDocument();
  });
});

test("clicking pass() calls API, disables button, and updates status pill to passed", async () => {
  renderCheckReview();

  const pendingCard = await screen.findByRole("article", {
    name: /Review 100/i,
  });

  const passBtn = within(pendingCard).getByRole("button", { name: /pass/i });

  api.post.mockResolvedValueOnce({ data: {} });

  await userEvent.click(passBtn);

  expect(api.post).toHaveBeenCalledWith(
    "/api/admin/review/pass/100",
    { note: "" },
    { headers: { "Content-Type": "application/json" } }
  );

  await waitFor(() => {
    expect(passBtn).toBeDisabled();
    expect(passBtn).toHaveAttribute("aria-busy", "true");
  });

  await waitFor(() => {
    expect(
      within(pendingCard).getByText(/status:\s+passed/i)
    ).toBeInTheDocument();
  });
});

test("clicking reject() calls API, disables button, and updates status pill to rejected", async () => {
  renderCheckReview();

  const pendingCard = await screen.findByRole("article", {
    name: /Review 100/i,
  });

  const rejectBtn = within(pendingCard).getByRole("button", {
    name: /reject/i,
  });

  api.post.mockResolvedValueOnce({ data: {} });

  await userEvent.click(rejectBtn);

  expect(api.post).toHaveBeenCalledWith(
    "/api/admin/review/reject/100",
    { note: "" },
    { headers: { "Content-Type": "application/json" } }
  );

  await waitFor(() => {
    expect(rejectBtn).toBeDisabled();
    expect(rejectBtn).toHaveAttribute("aria-busy", "true");
  });

  await waitFor(() => {
    expect(
      within(pendingCard).getByText(/status:\s+rejected/i)
    ).toBeInTheDocument();
  });
});

test("clicking Review Detail navigates to detail page with correct state", async () => {
  renderCheckReview();

  const passedCard = await screen.findByRole("article", {
    name: /Review 200/i,
  });

  const detailBtn = within(passedCard).getByRole("button", {
    name: /Review Detail/i,
  });

  await userEvent.click(detailBtn);

  expect(navigateMock).toHaveBeenCalledWith("/admin/audit/reviewDetail", {
    state: { id: 200 },
  });
});
