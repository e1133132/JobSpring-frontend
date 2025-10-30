/* eslint-disable */
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import JobDetail from "./jobDetail.jsx";

vi.mock("../../App.css", () => ({}));

vi.mock("../../services/api.js", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("../../services/authService.js", () => ({
    getCurrentUser: vi.fn(() => ({
        fullName: "Alice",
        role: "CANDIDATE",
    })),
}));

vi.mock("../navigation.jsx", () => ({
    default: () => <div data-testid="nav" />,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: () => ({ id: "123" }),
        useNavigate: () => mockNavigate,
    };
});

import api from "../../services/api.js";

function renderJobDetail() {
    return render(
        <MemoryRouter>
            <JobDetail />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
    localStorage.setItem("jobspring_token", "fake_token");
});

function setupApiMocks(jobData) {
    api.get.mockImplementation((url) => {
        if (url === "/api/job_seeker/job_list") {
            return Promise.resolve({ data: { content: [jobData] } });
        }
        if (url.includes("/api/job_favorites/")) {
            return Promise.resolve({ data: false });
        }
        if (url === "/api/profile") {
            return Promise.resolve({ data: { profile: { summary: "Test summary" } } });
        }
        return Promise.resolve({ data: {} });
    });
}

test("loads and displays job details correctly", async () => {
    const job = {
        id: 123,
        title: "Software Engineer",
        company: "Infineon",
        location: "Singapore",
        salaryMin: 5000,
        salaryMax: 9000,
        description: "Develop backend microservices",
        employmentType: 1,
        postedAt: "2025-10-01T12:00:00Z",
        companyId: 10,
    };
    setupApiMocks(job);

    renderJobDetail();
    const title = await screen.findByText((t) => t.includes("Software Engineer"));
    expect(title).toBeInTheDocument();
    expect(screen.getByText(/Infineon/i)).toBeInTheDocument();
    expect(screen.getByText(/Develop backend/i)).toBeInTheDocument();
});

test("toggles favorite status correctly", async () => {
    const job = {
        id: 123,
        title: "Backend Developer",
        company: "ST Engineering",
        location: "Singapore",
        employmentType: 2,
        salaryMin: 4000,
        salaryMax: 7000,
        description: "Maintain APIs",
    };
    setupApiMocks(job);

    api.post.mockResolvedValueOnce({});
    api.delete.mockResolvedValueOnce({});

    renderJobDetail();
    const title = await screen.findByText(/Backend Developer/);
    expect(title).toBeInTheDocument();

    const favBtn = screen.getAllByRole("button").find((btn) => btn.innerHTML.includes("svg"));
    await userEvent.click(favBtn);
    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith("Saved: Backend Developer")
    );
    await userEvent.click(favBtn);
    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith("Removed from favorites: Backend Developer")
    );
});

test("applies successfully when file selected", async () => {
    const job = {
        id: 123,
        title: "QA Engineer",
        company: "Keysight",
        location: "Malaysia",
        description: "Testing systems",
        employmentType: 3,
    };
    setupApiMocks(job);
    api.post.mockResolvedValueOnce({ data: {} });

    renderJobDetail();
    const jobTitle = await screen.findByText((t) => t.includes("QA Engineer"));
    expect(jobTitle).toBeInTheDocument();

    const applyBtn = screen.getByRole("button", { name: /Apply Now/i });
    await userEvent.click(applyBtn);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    const file = new File(["resume"], "resume.pdf", { type: "application/pdf" });
    await userEvent.upload(fileInput, file);

    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith("Apply success!")
    );
});

test("shows error alert when apply fails", async () => {
    const job = {
        id: 123,
        title: "Frontend Engineer",
        company: "OSOME",
        location: "Singapore",
        description: "React developer",
    };
    setupApiMocks(job);
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    renderJobDetail();
    const title = await screen.findByText((t) => t.includes("Frontend Engineer"));
    expect(title).toBeInTheDocument();

    const applyBtn = screen.getByRole("button", { name: /Apply Now/i });
    await userEvent.click(applyBtn);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const file = new File(["resume"], "resume.pdf", { type: "application/pdf" });
    await userEvent.upload(fileInput, file);

    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith("Apply failed!")
    );
});

test("alerts when applying without file", async () => {
    const job = {
        id: 123,
        title: "Data Analyst",
        company: "Google",
        location: "Singapore",
        description: "Analyze data",
    };
    setupApiMocks(job);

    renderJobDetail();
    const title = await screen.findByText((t) => t.includes("Data Analyst"));
    expect(title).toBeInTheDocument();

    const applyBtn = screen.getByRole("button", { name: /Apply Now/i });
    await userEvent.click(applyBtn);

    const submitBtn = screen.getByRole("button", { name: /Submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith(
            "Please upload your resume file before applying!"
        )
    );
});
