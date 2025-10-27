/* eslint-disable */
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ReviewUpload from "./reviewUpload.jsx";

vi.mock("../../App.css", () => ({}));
vi.mock("../navigation.jsx", () => ({
    default: () => <div data-testid="nav" />,
}));
vi.mock("../../services/authService", () => ({
    getCurrentUser: vi.fn(() => ({
        fullName: "John Doe",
        role: "CANDIDATE",
    })),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("../../services/api.js", () => ({
    default: {
        post: vi.fn(),
    },
}));

import api from "../../services/api.js";

const flushPromises = () => new Promise(setImmediate);

function renderReviewUpload() {
    return render(
        <MemoryRouter>
            <ReviewUpload />
        </MemoryRouter>
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.setItem("jobspring_token", "fake_token");
    vi.spyOn(window, "alert").mockImplementation(() => {});
});

test("renders all input fields and buttons", () => {
    renderReviewUpload();

    expect(screen.getByPlaceholderText(/Enter your application ID/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Review title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write your review here/i)).toBeInTheDocument();
    expect(document.querySelector('input[type="file"]')).toBeTruthy();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Submit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();
});

test("submits form successfully", async () => {
    api.post.mockResolvedValueOnce({ data: { message: "success" } });
    renderReviewUpload();

    await userEvent.type(screen.getByPlaceholderText(/Enter your application ID/i), "200");
    await userEvent.type(screen.getByPlaceholderText(/Review title/i), "Excellent job");
    await userEvent.type(screen.getByPlaceholderText(/Write your review here/i), "It was great!");

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["fake"], "screenshot.png", { type: "image/png" });

    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await flushPromises();
    });

    expect(fileInput.files[0].name).toBe("screenshot.png");

    await userEvent.selectOptions(screen.getByRole("combobox"), "4");

    await act(async () => {
        const form = document.querySelector("form");
        fireEvent.submit(form);
        await flushPromises();
    });

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1));

    const [url, body, config] = api.post.mock.calls[0];
    expect(url).toMatch(/job_seeker\/postReview/);
    expect(Number(body.applicationId)).toBe(200);
    expect(body.title).toBe("Excellent job");
    expect(body.content).toBe("It was great!");
    expect(Number(body.rating)).toBe(4);
    expect(config.headers.Authorization).toContain("Bearer");

    expect(window.alert).toHaveBeenCalledWith("Review submitted successfully!");
});

test("alerts when API call fails", async () => {
    api.post.mockRejectedValueOnce(new Error("Network Error"));
    renderReviewUpload();

    await userEvent.type(screen.getByPlaceholderText(/Enter your application ID/i), "2");
    await userEvent.type(screen.getByPlaceholderText(/Review title/i), "Bug test");
    await userEvent.type(screen.getByPlaceholderText(/Write your review here/i), "Failing API");

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(["fake"], "test.png", { type: "image/png" });

    await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
        await flushPromises();
    });

    await act(async () => {
        const form = document.querySelector("form");
        fireEvent.submit(form);
        await flushPromises();
    });

    await waitFor(() =>
        expect(window.alert).toHaveBeenCalledWith("Failed to submit review, check console for details.")
    );
});

test("resets form when clicking reset button", async () => {
    renderReviewUpload();

    const titleInput = screen.getByPlaceholderText(/Review title/i);
    await userEvent.type(titleInput, "Old Title");

    await act(async () => {
        await userEvent.click(screen.getByRole("button", { name: /Reset/i }));
        await flushPromises();
    });

    expect(titleInput.value).toBe("");
});

test("navigates back to /home on back button click", async () => {
    renderReviewUpload();

    await act(async () => {
        await userEvent.click(screen.getByRole("button", { name: /Back/i }));
        await flushPromises();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/home");
});
