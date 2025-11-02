/* eslint-disable */

import React from "react";
import { vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

beforeAll(() => {
  global.URL.createObjectURL = vi.fn(() => "mock-preview-url");
});

vi.mock("../navigation.jsx", () => ({
  default: ({ role, username }) => (
    <div data-testid="nav">
      NAV {username} ({role})
    </div>
  ),
}));

vi.mock("../../services/authService", () => ({
  getCurrentUser: () => ({ role: 2, fullName: "Admin User" }),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const real = await vi.importActual("react-router-dom");
  return {
    ...real,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../services/api.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

const swalFireMock = vi.fn();
vi.mock("sweetalert2", () => ({
  default: { fire: (...args) => swalFireMock(...args) },
  fire: (...args) => swalFireMock(...args),
}));

vi.mock("react-icons/fa", () => ({
  FaArrowLeft: (props) => <span {...props} data-testid="icon-left" />,
}));

if (!("createObjectURL" in URL)) {
  URL.createObjectURL = vi.fn(() => "blob://preview");
}
if (!("revokeObjectURL" in URL)) {
  URL.revokeObjectURL = vi.fn(() => {});
}

import api from "../../services/api.js";
import Swal from "sweetalert2";
import CreateCompany from "./createCompany.jsx";

function renderCreateCompany() {
  return render(
    <MemoryRouter>
      <CreateCompany />
    </MemoryRouter>
  );
}

function getNameInput() {
  const nameLabel = screen.getByText(/Name/i);
  const field = nameLabel.closest(".field");
  return within(field).getByRole("textbox", { name: "" });
}

function getWebsiteInput() {
  return screen.getByPlaceholderText("https://www.example.com");
}

function getDescriptionTextarea() {
  const descLabel = screen.getByText(/Description/i);
  const field = descLabel.closest(".field");
  return within(field).getByRole("textbox");
}

function getFileInputNode() {
  return document.querySelector('input[type="file"]');
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("renders form fields and navigation header", () => {
  renderCreateCompany();

  expect(screen.getByTestId("nav")).toHaveTextContent("NAV Admin User (2)");

  expect(screen.getByRole("button", { name: /Back/i })).toBeInTheDocument();

  const nameLabel = screen.getByText(/Name/i);
  const nameField = nameLabel.closest(".field");
  expect(nameField).toBeInTheDocument();
  expect(within(nameField).getByRole("textbox")).toBeInTheDocument();

  expect(
    screen.getByPlaceholderText("https://www.example.com")
  ).toBeInTheDocument();

  const fileInput = getFileInputNode();
  expect(fileInput).toBeInTheDocument();

  const descLabel = screen.getByText(/Description/i);
  const descField = descLabel.closest(".field");
  expect(descField).toBeInTheDocument();
  expect(within(descField).getByRole("textbox")).toBeInTheDocument();

  expect(screen.getByRole("button", { name: /Reset/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Create/i })).toBeInTheDocument();
});

import { fireEvent } from "@testing-library/react";

test("client-side validation shows errors (missing name, invalid website)", async () => {
  renderCreateCompany();

  const nameInput = getNameInput();
  const websiteInput = getWebsiteInput();

  await userEvent.clear(nameInput);

  await userEvent.clear(websiteInput);
  await userEvent.type(websiteInput, "not-a-url");

  const formEl = document.querySelector("form");
  fireEvent.submit(formEl);

  await waitFor(() => {
    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Website must be a valid http(s) URL.")
    ).toBeInTheDocument();
  });

  expect(api.post).not.toHaveBeenCalled();
});


test("picking a non-image file or too-large file shows error, valid image shows preview", async () => {
  renderCreateCompany();

  const logoLabel = screen.getByText(/Logo/i);
  const logoField = logoLabel.closest(".field");
  expect(logoField).toBeInTheDocument();

  const fileInput = getFileInputNode();
  expect(fileInput).toBeInTheDocument();

  const badFile = new File(["hello"], "not-image.txt", { type: "text/plain" });
  await userEvent.upload(fileInput, badFile);

  const bigFile = new File(["x".repeat(3 * 1024 * 1024 + 1)], "big.png", {
    type: "image/png",
  });
  await userEvent.upload(fileInput, bigFile);

  const okFile = new File(["abc"], "logo.png", { type: "image/png" });
  await userEvent.upload(fileInput, okFile);

  const previewImg = await screen.findByAltText("Logo preview");
  expect(previewImg).toBeInTheDocument();
  expect(previewImg.getAttribute("src")).toBe("blob://preview");

});



test("successful submit posts FormData, shows success Swal, then navigates back", async () => {
  renderCreateCompany();

  const nameInput = getNameInput();
  const descTextarea = getDescriptionTextarea();
  const fileInput = getFileInputNode();
  const createBtn = screen.getByRole("button", { name: /Create/i });

  await userEvent.type(nameInput, "ACME Inc.");
  await userEvent.type(descTextarea, "We build rockets.");

  const logoFile = new File(["abc"], "acme.png", { type: "image/png" });
  await userEvent.upload(fileInput, logoFile);

  api.post.mockResolvedValueOnce({
    data: { id: 123 },
  });

  const swalResolve = Promise.resolve();
  swalFireMock.mockReturnValueOnce(swalResolve);

  await userEvent.click(createBtn);

  expect(api.post).toHaveBeenCalledTimes(1);

  const [urlArg, formDataArg, configArg] = api.post.mock.calls[0];
  expect(urlArg).toBe("/api/admin/company/create");
  expect(formDataArg instanceof FormData).toBe(true);
  expect(typeof configArg.onUploadProgress).toBe("function");

  const entries = [];
  formDataArg.forEach((value, key) => {
    entries.push([key, value]);
  });

  const companyEntry = entries.find(([k]) => k === "company");
  expect(companyEntry).toBeTruthy();
  const companyBlob = companyEntry[1];
  expect(companyBlob instanceof Blob).toBe(true);
  expect(companyBlob.type).toBe("application/json");

  const logoEntry = entries.find(([k]) => k === "logo");
  expect(logoEntry).toBeTruthy();
  const sentFile = logoEntry[1];
  expect(sentFile instanceof File).toBe(true);
  expect(sentFile.name).toBe("acme.png");
  expect(sentFile.type).toBe("image/png");

  expect(swalFireMock).toHaveBeenCalledWith({
    icon: "success",
    title: "Company created",
    text: "ID: 123",
  });

  await waitFor(() => {
    expect(navigateMock).toHaveBeenCalledWith(-1);
  });
});

test("failed submit shows error alert (SweetAlert2) and does not navigate", async () => {
  renderCreateCompany();

  const nameInput = getNameInput();
  const createBtn = screen.getByRole("button", { name: /Create/i });

  await userEvent.type(nameInput, "ACME Inc.");

  const swalResolve = Promise.resolve();
  swalFireMock.mockReturnValueOnce(swalResolve);

  await userEvent.click(createBtn);

  await waitFor(() => {
    expect(swalFireMock).toHaveBeenCalledWith({
      icon: "error",
      title: "Failed",
      text: "Duplicate company name",
    });
  });

  expect(navigateMock).not.toHaveBeenCalled();
});
