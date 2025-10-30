/* eslint-disable */
import { vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
vi.mock("../../App.css", () => ({}));

vi.mock("axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

vi.mock("../../services/authService", () => ({
    getCurrentUser: vi.fn(() => ({
        fullName: "Alice HR",
        role: "HR",
        email: "alice@example.com",
    })),
}));

vi.mock("../navigation.jsx", () => ({
    default: ({ role, username }) => (
        <div data-testid="nav">
            Navigation-{role}-{username}
        </div>
    ),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

import Profile from "./Profile.jsx";
import axios from "axios";

function renderProfile() {
    return render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
    localStorage.setItem("jobspring_token", "fake_token");
    axios.get.mockReset();
    axios.post.mockReset();
});

test("renders profile and loads initial data", async () => {
    axios.get
        .mockResolvedValueOnce({
            data: {
                profile: { summary: "Hello world", visibility: 2 },
                education: [
                    {
                        school: "NUS",
                        degree: "MTech",
                        major: "Software Engineering",
                        gpa: 4.3,
                        start_date: "2023-01-01",
                        end_date: "2024-01-01",
                    },
                ],
                experience: [
                    {
                        company: "ST Engineering",
                        title: "Intern",
                        achievements: "Worked on backend APIs",
                        start_date: "2024-01-01",
                        end_date: "2024-06-01",
                    },
                ],
                skills: [
                    {
                        skill_id: 1,
                        skill_name: "Java",
                        level: 3,
                        years: 2.5,
                    },
                ],
            },
        })
        .mockResolvedValueOnce({
            data: [
                { id: 1, name: "Java", category: "Backend" },
                { id: 2, name: "React", category: "Frontend" },
            ],
        });

    renderProfile();

    await waitFor(() =>
        expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument()
    );
    expect(screen.getByDisplayValue("NUS")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ST Engineering")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Java")).toBeInTheDocument();
});

test("submits profile successfully", async () => {
    axios.get
        .mockResolvedValueOnce({ data: { profile: {}, education: [], experience: [], skills: [] } })
        .mockResolvedValueOnce({
            data: [
                { id: 1, name: "Java", category: "Backend" },
                { id: 2, name: "React", category: "Frontend" },
            ],
        });
    axios.post.mockResolvedValueOnce({ data: { ok: true } });

    renderProfile();

    await waitFor(() => screen.getByText("Skill"));

    const summaryInput = await screen.findByPlaceholderText(/profile summary/i);
    await userEvent.clear(summaryInput);
    await userEvent.type(summaryInput, "Updated summary text");

    const skillLabel = await screen.findByText("Skill");
    const skillSelect = skillLabel.nextElementSibling;
    expect(skillSelect.tagName).toBe("SELECT");
    await userEvent.selectOptions(skillSelect, "1");

    const saveBtn = screen.getByRole("button", { name: /Save/i });
    await userEvent.click(saveBtn);

    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith("Profile Submitted Successfully!")
    );

    expect(axios.post).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({
            profile: expect.objectContaining({
                summary: "Updated summary text",
            }),
        }),
        expect.any(Object)
    );
});

test("shows alert when submission fails", async () => {
    axios.get
        .mockResolvedValueOnce({ data: { profile: {}, education: [], experience: [], skills: [] } })
        .mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error("Network Error"));

    global.alert = vi.fn();

    renderProfile();

    const saveBtn = await screen.findByRole("button", { name: /Save/i });
    await userEvent.click(saveBtn);

    await waitFor(() =>
        expect(global.alert).toHaveBeenCalledWith(
            "Failed to submit profile, check console for details."
        )
    );
});

test("navigates back when Back button is clicked", async () => {
    axios.get
        .mockResolvedValueOnce({ data: { profile: {}, education: [], experience: [], skills: [] } })
        .mockResolvedValueOnce({ data: [] });

    renderProfile();

    const backBtn = await screen.findByRole("button", { name: /Back/i });
    await userEvent.click(backBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/home");
});

test("resets all form fields when Reset button clicked", async () => {
    axios.get
        .mockResolvedValueOnce({
            data: {
                profile: { summary: "Something" },
                education: [{ school: "NUS" }],
                experience: [{ company: "ST" }],
                skills: [{ skill_name: "Java" }],
            },
        })
        .mockResolvedValueOnce({ data: [] });

    renderProfile();

    await waitFor(() => screen.getByDisplayValue("Something"));
    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    await userEvent.click(resetBtn);

    await waitFor(() => expect(screen.getByPlaceholderText(/Please enter your profile summary/i).value).toBe(""));
});
