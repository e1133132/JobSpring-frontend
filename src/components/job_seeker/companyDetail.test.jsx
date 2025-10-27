/* eslint-disable */
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CompanyDetail from "./companyDetail.jsx";

vi.mock("../../App.css", () => ({}));

vi.mock("../../services/api.js", () => ({
    default: {
        get: vi.fn(),
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
        useParams: () => ({ companyId: "1" }),
        useNavigate: () => mockNavigate,
    };
});

import api from "../../services/api.js";

function renderCompanyDetail() {
    return render(
        <MemoryRouter>
            <CompanyDetail />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.setItem("jobspring_token", "fake_token");
});

test("renders company details successfully", async () => {
    api.get.mockImplementation((url) => {
        if (url.includes("/api/job_seeker/company/1")) {
            return Promise.resolve({
                data: {
                    id: 1,
                    name: "Infineon Technologies",
                    location: "Singapore",
                    website: "https://www.infineon.com",
                    description: "A semiconductor leader",
                    logoUrl: "https://logo.png",
                },
            });
        }
        if (url.includes("/api/companies/1/jobs")) {
            return Promise.resolve({ data: { content: [] } });
        }
        if (url.includes("/api/companies/1/reviews")) {
            return Promise.resolve({ data: { content: [] } });
        }
        return Promise.resolve({ data: {} });
    });

    renderCompanyDetail();

    expect(await screen.findByText("Infineon Technologies")).toBeInTheDocument();
    expect(screen.getByText(/Singapore/)).toBeInTheDocument();
    expect(screen.getByText(/A semiconductor leader/)).toBeInTheDocument();

    const logo = screen.getByAltText(/Company Logo/i);
    expect(logo).toHaveAttribute("src", "https://logo.png");

    expect(screen.getByText("Company Intro")).toHaveStyle("background: #111827");
});

test("shows error message when company fetch fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Network Error"));
    renderCompanyDetail();
    expect(await screen.findByText(/Failed to load company details/i)).toBeInTheDocument();
});

test("shows jobs list when 'Posted Jobs' tab is clicked", async () => {
    api.get.mockImplementation((url) => {
        if (url.includes("/api/job_seeker/company/1")) {
            return Promise.resolve({
                data: { id: 1, name: "Keysight", description: "Hardware testing firm" },
            });
        }
        if (url.includes("/api/companies/1/jobs")) {
            return Promise.resolve({
                data: {
                    content: [
                        {
                            id: 123,
                            title: "QA Engineer",
                            salaryMin: 4000,
                            salaryMax: 7000,
                            description: "Test automation",
                            postedAt: "2025-10-01T12:00:00Z",
                        },
                    ],
                },
            });
        }
        if (url.includes("/api/companies/1/reviews")) {
            return Promise.resolve({ data: { content: [] } });
        }
    });

    renderCompanyDetail();

    const jobsTab = await screen.findByRole("button", { name: "Posted Jobs" });
    await userEvent.click(jobsTab);

    await waitFor(() => {
        expect(screen.getByText(/QA Engineer/i)).toBeInTheDocument();
    });

    const salary = screen.getByText(/Salary:/i);
    expect(salary.textContent).toContain("$4000");
    expect(salary.textContent).toContain("$7000");
});

test("shows reviews list when 'Reviews' tab is clicked", async () => {
    api.get.mockImplementation((url) => {
        if (url.includes("/api/job_seeker/company/1")) {
            return Promise.resolve({
                data: { id: 1, name: "OSOME", description: "Accounting platform" },
            });
        }
        if (url.includes("/api/companies/1/jobs")) {
            return Promise.resolve({ data: { content: [] } });
        }
        if (url.includes("/api/companies/1/reviews")) {
            return Promise.resolve({
                data: {
                    content: [
                        {
                            reviewId: 1,
                            content: "Great place to work!",
                            rating: 5,
                            publicAt: "2025-10-10T12:00:00Z",
                        },
                    ],
                },
            });
        }
    });

    renderCompanyDetail();

    const reviewsTab = await screen.findByRole("button", { name: "Reviews" });
    await userEvent.click(reviewsTab);

    await waitFor(() => {
        expect(screen.getByText(/Great place to work/i)).toBeInTheDocument();
        expect(screen.getByText(/⭐ 5 \/ 5/i)).toBeInTheDocument();
    });
});

test("navigates back when 'Back' button clicked", async () => {
    api.get.mockImplementation((url) => {
        if (url.includes("/api/job_seeker/company/1")) {
            return Promise.resolve({
                data: { id: 1, name: "Google", description: "Search company" },
            });
        }
        if (url.includes("/api/companies/1/jobs")) {
            return Promise.resolve({ data: { content: [] } });
        }
        if (url.includes("/api/companies/1/reviews")) {
            return Promise.resolve({ data: { content: [] } });
        }
    });

    renderCompanyDetail();
    const backButton = await screen.findByRole("button", { name: /Back/i });
    await userEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith(-1);
});
