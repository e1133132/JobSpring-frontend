/* eslint-disable */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import userEvent from "@testing-library/user-event";

import ReviewDetail from "./reviewDetails.jsx";

vi.mock("../navigation.jsx", () => ({
  __esModule: true,
  default: ({ role, username }) => (
    <div data-testid="nav">
      {role}:{username}
    </div>
  ),
}));

vi.mock("../../services/authService", () => ({
  __esModule: true,
  getCurrentUser: () => ({
    role: 2,
    fullName: "Alice Admin",
  }),
}));

const swalFireMock = vi.fn();
vi.mock("sweetalert2", () => ({
  __esModule: true,
  default: {
    fire: (...args) => swalFireMock(...args),
  },
}));

const apiGetMock = vi.fn();
const apiPatchMock = vi.fn();
vi.mock("../../services/api.js", () => ({
  __esModule: true,
  default: {
    get: (...args) => apiGetMock(...args),
    patch: (...args) => apiPatchMock(...args),
  },
}));

function renderWithLocationState(stateObj) {
  return render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/admin/review/detail", state: stateObj },
      ]}
    >
      <ReviewDetail />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

const pendingReviewPayload = {
  id: 10,
  application_id: 123,
  title: "Great place, would join",
  content: "The interview was smooth and respectful.",
  rating: 5,
  status: 0,
  submitted_at: "2025-10-26T12:00:00Z",
  reviewed_by: "HR-Linda",
  public_at: null,
  review_note: "Initial review pending final approval",
  imageurl: "/uploads/review-10.png",
};

const approvedReviewPayload =
{
  id: 99,
  applicationId: 777,
  title: "Amazing culture",
  content: "Super positive overall.",
  rating: 4,
  status: 2,
  submittedAt: "2025-10-25T09:30:00Z",
  reviewedBy: "Admin-Mike",
  publicAt: "2025-10-27T00:00:00Z",
  reviewNote: "",
  imageUrl: "",
}

test("loads first review from /api/admin/check_review and renders Pending review with image and actions", async () => {
  apiGetMock.mockResolvedValueOnce({
    data: pendingReviewPayload,
  });

  renderWithLocationState({ id: 10 });

  expect(apiGetMock).toHaveBeenCalledWith("/api/admin/check_review/10");

  await screen.findByText("Great place, would join");

  expect(screen.getAllByText(/Review #\s*10/i)[0]).toBeInTheDocument();

  expect(screen.getByText(/For Application:/i)).toBeInTheDocument();
  expect(screen.getByText("123")).toBeInTheDocument();

  expect(screen.getByText(/Title:/i)).toBeInTheDocument();
  expect(screen.getByText(/Great place, would join/i)).toBeInTheDocument();

  expect(screen.getByText("Rating")).toBeInTheDocument();
  expect(screen.getByText("5")).toBeInTheDocument();

  expect(screen.getByText(/Submitted At/i)).toBeInTheDocument();
  expect(screen.getByText(/Reviewed By/i)).toBeInTheDocument();
  expect(screen.getByText(/HR-Linda/i)).toBeInTheDocument();
  expect(screen.getByText(/Public At/i)).toBeInTheDocument();

  expect(screen.getByText("Content")).toBeInTheDocument();
  expect(
    screen.getByText("The interview was smooth and respectful.")
  ).toBeInTheDocument();

  expect(screen.getByText("Review Note")).toBeInTheDocument();
  expect(
    screen.getByText("Initial review pending final approval")
  ).toBeInTheDocument();

  expect(screen.getByText(/Attachment \(Image\)/i)).toBeInTheDocument();

  expect(screen.getByText("No Image")).toBeInTheDocument();
  expect(screen.getByText("No image to preview.")).toBeInTheDocument();

  const rejectBtn = screen.getByRole("button", { name: /reject/i });
  const approveBtn = screen.getByRole("button", { name: /approve/i });
  expect(rejectBtn).toBeEnabled();
  expect(approveBtn).toBeEnabled();
});

test("renders Approved chip and disables Approve button when status=2", async () => {
  apiGetMock.mockResolvedValueOnce({
    data: approvedReviewPayload,
  })

  renderWithLocationState({ id: 99 })

  expect(apiGetMock).toHaveBeenCalledWith("/api/admin/check_review/99")

  await screen.findByText("Amazing culture");

  expect(screen.getByText(/Approved/i)).toBeInTheDocument();
  expect(screen.getByText(/Approved/i, { selector: ".chip" })).toBeInTheDocument();
  expect(screen.getAllByText(/Review #\s*99/i)[0]).toBeInTheDocument();

  expect(screen.getByText(/For Application:/i)).toBeInTheDocument()
  expect(screen.getByText("777")).toBeInTheDocument()

  expect(screen.getByText(/Amazing culture/i)).toBeInTheDocument()

  expect(screen.getByText("No Image")).toBeInTheDocument()

  expect(screen.getByText("No image to preview.")).toBeInTheDocument()

  const rejectBtn = screen.getByRole("button", { name: /reject/i })
  const approveBtn = screen.getByRole("button", { name: /approve/i })

  expect(approveBtn).toBeDisabled()
  expect(rejectBtn).toBeEnabled()
})

test("click Approve calls PATCH with status=2 and shows success Swal", async () => {
  apiGetMock.mockResolvedValueOnce({
    data: pendingReviewPayload,
  });

  apiPatchMock.mockResolvedValueOnce({
    data: {},
  });

  renderWithLocationState({ id: 10 });

  expect(await screen.findByText(/Pending/i, { selector: ".chip" })).toBeInTheDocument();

  const approveBtn = screen.getByRole("button", { name: /approve/i });
  expect(approveBtn).toBeEnabled();

  await userEvent.click(approveBtn);

  expect(apiPatchMock).toHaveBeenCalledWith(
    "/api/admin/review/pass/10",
    { status: 2 }
  );

  await waitFor(() => {
    expect(swalFireMock).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: "success",
        title: "Success",
        text: "Review approved.",
      })
    );
  });
});
