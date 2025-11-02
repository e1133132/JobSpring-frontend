/* eslint-disable */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Apply_progress from "./apply_progress.jsx";

vi.mock("../../App.css", () => ({}));

vi.mock("../../services/api.js", () => ({
  default: {
    get: vi.fn(),
  },
}));
import api from "../../services/api.js";

vi.mock("../../services/authService", () => ({
  getCurrentUser: vi.fn(() => ({
    fullName: "John Doe",
    role: "CANDIDATE",
  })),
}));

vi.mock("../navigation.jsx", () => ({
  default: () => <div data-testid="nav" />,
}));

function renderApplyProgress() {
  return render(
    <MemoryRouter>
      <Apply_progress />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  global.localStorage.setItem("jobspring_token", "fake_token");
});

test("renders submitted applications correctly", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 1,
            jobId: 101,
            jobTitle: "Backend Engineer",
            companyName: "Keysight",
            appliedAt: "2025-10-10T10:00:00Z",
            status: 0,
          },
          {
            id: 2,
            jobId: 102,
            jobTitle: "Frontend Developer",
            companyName: "OSOME",
            appliedAt: "2025-10-12T12:00:00Z",
            status: 1,
          },
        ],
      },
    })
    .mockResolvedValueOnce({
      data: { content: [], totalElements: 0 },
    });

  renderApplyProgress();

  expect(await screen.findByText(/Backend Engineer/i)).toBeInTheDocument();
  expect(screen.getByText(/Keysight/)).toBeInTheDocument();
  expect(screen.getByText(/Submitted/i)).toBeInTheDocument();

  expect(screen.getByRole("tab", { name: /Submitted/ }).textContent).toContain("1");
  expect(screen.getByRole("tab", { name: /Viewed/ }).textContent).toContain("1");
});

test("switches to viewed tab and shows viewed applications", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 1,
            jobId: 201,
            jobTitle: "Data Analyst",
            companyName: "Infineon",
            appliedAt: "2025-10-13T09:00:00Z",
            status: 1,
          },
        ],
      },
    })
    .mockResolvedValueOnce({
      data: { content: [], totalElements: 0 },
    });

  renderApplyProgress();

  const viewedTab = await screen.findByRole("tab", { name: /Viewed/i });
  await userEvent.click(viewedTab);

  expect(await screen.findByText(/Data Analyst/i)).toBeInTheDocument();
  expect(screen.getByText(/Infineon/)).toBeInTheDocument();
});

test("shows resume_passed tab applications", async () => {
  api.get
    .mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 3,
            jobId: 303,
            jobTitle: "QA Tester",
            companyName: "Google",
            appliedAt: "2025-10-14T09:00:00Z",
            status: 2,
          },
        ],
      },
    })
    .mockResolvedValueOnce({
      data: { content: [], totalElements: 0 },
    });

  renderApplyProgress();

  const passedTab = await screen.findByRole("tab", { name: /Passed/i });
  await userEvent.click(passedTab);

  expect(await screen.findByText(/QA Tester/i)).toBeInTheDocument();
  expect(screen.getByText(/Google/)).toBeInTheDocument();
});

test("shows saved jobs when 'Saved' tab clicked", async () => {
  api.get
    .mockResolvedValueOnce({
      data: { content: [] }, 
    })
    .mockResolvedValueOnce({
      data: {
        content: [
          {
            id: 501,
            jobId: 909,
            title: "Cloud Engineer",
            company: "Amazon",
            favoritedAt: "2025-10-13T10:00:00Z",
          },
        ],
        totalElements: 1,
      },
    });

  renderApplyProgress();

  const savedTab = await screen.findByRole("tab", { name: /Saved/i });
  await userEvent.click(savedTab);

  expect(await screen.findByText(/Cloud Engineer/i)).toBeInTheDocument();
  expect(screen.getByText(/Amazon/)).toBeInTheDocument();

  expect(screen.getByRole("tab", { name: /Saved/ }).textContent).toContain("1");
});

test("shows empty state when no applications exist", async () => {
  api.get
    .mockResolvedValueOnce({
      data: { content: [] },
    })
    .mockResolvedValueOnce({
      data: { content: [], totalElements: 0 },
    });

  renderApplyProgress();

  expect(await screen.findByText(/No applications in this status/i)).toBeInTheDocument();

  const savedTab = screen.getByRole("tab", { name: /Saved/i });
  await userEvent.click(savedTab);
  expect(await screen.findByText(/No saved jobs yet/i)).toBeInTheDocument();
});
