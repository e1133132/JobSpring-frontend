/* eslint-disable */
import { render, screen, waitFor, act } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import ProfileHR from "./profile_hr.jsx";

vi.mock("../../App.css", () => ({}));

vi.mock("../navigation.jsx", () => ({
    default: ({ username }) => <div data-testid="nav">Navigation for {username}</div>,
}));

vi.mock("../../services/authService", () => ({
    getCurrentUser: vi.fn(() => ({
        email: "hr@example.com",
        fullName: "HR Admin",
    })),
}));


vi.mock("../../services/api.js", () => ({
    default: {
        get: vi.fn(),
    },
}));

import api from "../../services/api.js";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

function renderProfileHR() {
    return render(
        <MemoryRouter>
            <ProfileHR />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem("jobspring_token", "fake_token");
    api.get.mockReset();
});

test("renders HR profile with initial values", async () => {
    api.get.mockResolvedValueOnce({ data: "Keysight Technologies" });

    renderProfileHR();

    expect(await screen.findByText(/YOUR HR PROFILE/i)).toBeInTheDocument();

    expect(screen.getByDisplayValue("HR Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("hr@example.com")).toBeInTheDocument();

    await waitFor(() =>
        expect(screen.getByDisplayValue("Keysight Technologies")).toBeInTheDocument()
    );
});

test("fetches and displays company name when token exists", async () => {
    api.get.mockResolvedValueOnce({ data: "Infineon Technologies" });

    renderProfileHR();

    await waitFor(() =>
        expect(api.get).toHaveBeenCalledWith(
            "/api/hr/company-name",
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: expect.stringContaining("Bearer fake_token"),
                }),
            })
        )
    );

    await waitFor(() =>
        expect(screen.getByDisplayValue("Infineon Technologies")).toBeInTheDocument()
    );
});

test("shows 'Not Available' if no token in localStorage", async () => {
    localStorage.removeItem("jobspring_token");
    api.get.mockResolvedValueOnce({ data: "Should not call" });

    renderProfileHR();

    await waitFor(() =>
        expect(screen.getByDisplayValue("Not Available")).toBeInTheDocument()
    );
});

test("shows error message when API request fails", async () => {
    api.get.mockRejectedValueOnce(new Error("Network Error"));
    renderProfileHR();

    await waitFor(() =>
        expect(screen.getByDisplayValue("Error fetching company name")).toBeInTheDocument()
    );
});

test("navigates back to /hr/JobPosition when Back button clicked", async () => {
    api.get.mockResolvedValueOnce({ data: "NUS-ISS" });
    renderProfileHR();

    const backButton = await screen.findByRole("button", { name: /Back/i });

    await act(async () => {
        await userEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/hr/JobPosition");
});
