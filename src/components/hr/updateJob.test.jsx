/* eslint-disable */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useParams } from "react-router-dom";
import UpdateJob from "./updateJob.jsx";
import { vi } from "vitest";

vi.mock("../../services/api.js", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
    },
}));
import api from "../../services/api.js";

vi.mock("../../services/authService.js", () => ({
    getCurrentUser: vi.fn(() => ({
        role: 1,
        fullName: "HR Admin",
    })),
}));
import { getCurrentUser } from "../../services/authService.js";

vi.mock("../../services/hrService.js", () => ({
    getCompanyId: vi.fn(() => Promise.resolve("company-123")),
}));
import { getCompanyId } from "../../services/hrService.js";

const navigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useParams: vi.fn(),
        useNavigate: () => navigate,
    };
});

function renderUpdateJob(jobId = "1") {
    useParams.mockReturnValue({ jobId });
    return render(
        <MemoryRouter>
            <UpdateJob />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset();
    api.patch.mockReset();
    getCompanyId.mockResolvedValue("company-123");
    getCurrentUser.mockReturnValue({ role: 1, fullName: "HR Admin" });
});

test("renders UpdateJob form fields correctly", async () => {
    api.get.mockResolvedValueOnce({
        data: {
            title: "Software Engineer",
            employmentType: 1,
            salaryMin: 4000,
            salaryMax: 7000,
            location: "Singapore",
            description: "Develop backend microservices",
        },
    });

    renderUpdateJob();

    await waitFor(() => {
        expect(screen.getByDisplayValue("Software Engineer")).toBeInTheDocument();
        expect(screen.getByDisplayValue("4000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("7000")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Singapore")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Develop backend microservices")).toBeInTheDocument();
    });
});

test("shows validation errors if required fields missing", async () => {
    renderUpdateJob();

    const submitBtn = screen.getByRole("button", { name: /update job/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Please enter the job name/i)).toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
});

test("submits valid form and shows success message", async () => {
    api.get.mockResolvedValueOnce({
        data: {
            title: "QA Engineer",
            employmentType: 1,
            salaryMin: 3000,
            salaryMax: 5000,
            location: "Singapore",
            description: "Test microservices",
        },
    });
    api.patch.mockResolvedValueOnce({ data: { success: true } });

    renderUpdateJob();

    await waitFor(() => screen.getByDisplayValue("QA Engineer"));

    fireEvent.change(screen.getByDisplayValue("QA Engineer"), {
        target: { value: "QA Automation Engineer" },
    });

    fireEvent.click(screen.getByRole("button", { name: /update job/i }));

    await waitFor(() =>
        expect(api.patch).toHaveBeenCalledWith(
            "/api/hr/companies/company-123/jobs/1",
            expect.objectContaining({
                title: "QA Automation Engineer",
            })
        )
    );

    expect(await screen.findByText(/Job updated successfully/i)).toBeInTheDocument();
});

test("shows error message when API update fails", async () => {
    api.get.mockResolvedValueOnce({
        data: {
            title: "DevOps Engineer",
            employmentType: 1,
            salaryMin: 5000,
            salaryMax: 7000,
            location: "Singapore",
            description: "Manage CI/CD pipelines",
        },
    });
    api.patch.mockRejectedValueOnce(new Error("500 Internal Error"));

    renderUpdateJob();

    await waitFor(() => screen.getByDisplayValue("DevOps Engineer"));

    fireEvent.click(screen.getByRole("button", { name: /update job/i }));

    await waitFor(() =>
        expect(screen.getByText(/Failed to update job/i)).toBeInTheDocument()
    );
});

test("shows server error message if fetching job details fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Network Error"));
    renderUpdateJob();
    await waitFor(() =>
        expect(screen.getByText(/Failed to load job details/i)).toBeInTheDocument()
    );
});

test("navigates back when Cancel clicked", async () => {
    api.get.mockResolvedValueOnce({
        data: {
            title: "Frontend Engineer",
            employmentType: 2,
            salaryMin: 2000,
            salaryMax: 3000,
            location: "Singapore",
            description: "Build React components",
        },
    });

    renderUpdateJob();

    await waitFor(() => screen.getByDisplayValue("Frontend Engineer"));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(navigate).toHaveBeenCalledWith("/hr/JobPosition");
});
