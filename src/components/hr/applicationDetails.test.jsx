/* eslint-disable */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ApplicationDetail from './applicationDetails'

vi.mock('../navigation.jsx', () => ({
  __esModule: true,
  default: ({ role, username }) => (
    <div data-testid="nav">{role}:{username}</div>
  ),
}));

vi.mock('../../services/authService', () => ({
  __esModule: true,
  getCurrentUser: () => ({
    role: 2,
    fullName: 'Alice Admin',
  }),
}));

const swalFireMock = vi.fn();
vi.mock('sweetalert2', () => ({
  __esModule: true,
  default: { fire: (...args) => swalFireMock(...args) },
}));

const apiGetMock = vi.fn();
const apiPatchMock = vi.fn();
vi.mock('../../services/api.js', () => ({
  __esModule: true,
  default: {
    get: (...args) => apiGetMock(...args),
    patch: (...args) => apiPatchMock(...args),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function renderWithLocationState(stateObj) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/hr/applications/detail", state: stateObj }]}
    >
      <ApplicationDetail />
    </MemoryRouter>
  );
}

test('Pending applicant with base64 pdf -> shows Pending chip and iframe preview', async () => {
  apiGetMock.mockImplementation((url) => {
    if (url === '/api/applications/1') {
      return Promise.resolve({
        data: {
          id: 1,
          status: 0, 
          jobTitle: 'Backend Engineer',
          applicantName: 'Bob',
          applicantEmail: 'bob@example.com',
          appliedAt: '2025-10-27T12:34:56Z',
          resumeUrl:
            'data:application/pdf;base64,JVBERi0xLjcKJfakePDFDATA...',
          resumeProfile: null,
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  renderWithLocationState({ id: 1 });

  expect(await screen.findByText(/Pending/i)).toBeInTheDocument();

  const iframe = await screen.findByTitle('resume-pdf');
  expect(iframe).toBeInTheDocument();

  const srcVal = iframe.getAttribute('src');
  expect(srcVal).toContain(
    'data:application/pdf;base64,JVBERi0xLjcKJfakePDFDATA...'
  );
  expect(srcVal).toMatch(/#toolbar=1&navpanes=0$/);

  expect(screen.getByText(/Application #1/i)).toBeInTheDocument();
  expect(screen.getByText(/Backend Engineer/i)).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
  expect(screen.getByText('bob@example.com')).toBeInTheDocument();

  expect(apiGetMock).toHaveBeenCalledWith('/api/applications/1');
});

test('No resumeUrl -> no iframe, shows "No Document"', async () => {
  apiGetMock.mockImplementation((url) => {
    if (url === '/api/applications/1') {
      return Promise.resolve({
        data: {
          id: 1,
          status: 0,
          jobTitle: 'No CV Job',
          applicantName: 'NoResume Guy',
          applicantEmail: 'noresume@example.com',
          appliedAt: '2025-10-28T01:23:45Z',
          resumeUrl: '',         
          resumeProfile: 'Summary text here...',
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  renderWithLocationState({ id: 1 });

  expect(await screen.findByText(/Pending/i)).toBeInTheDocument();

  const iframe = screen.queryByTitle('resume-pdf');
  expect(iframe).toBeNull();

  expect(screen.getByText(/No Document/i)).toBeInTheDocument();
});

test('Approved applicant (status=2) -> shows Approved chip and iframe, no atob crash', async () => {
  apiGetMock.mockImplementation((url) => {
    if (url === '/api/applications/2') {
      return Promise.resolve({
        data: {
          id: 2,
          status: 2,
          jobTitle: 'Frontend Engineer',
          applicantName: 'Helen',
          applicantEmail: 'helen@example.com',
          appliedAt: '2025-10-28T05:00:00Z',
          resumeUrl:
            'data:application/pdf;base64,JVBERi0xLjcKJVALIDFAKEBASE64==',
          resumeProfile: null,
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  renderWithLocationState({ id: 2 });

  expect(await screen.findByText(/Approved/i)).toBeInTheDocument();

  const iframe = await screen.findByTitle('resume-pdf');
  expect(iframe).toBeInTheDocument();
  const srcVal = iframe.getAttribute('src');
  expect(srcVal).toContain(
    'data:application/pdf;base64,JVBERi0xLjcKJVALIDFAKEBASE64=='
  );
  expect(srcVal).toMatch(/#toolbar=1&navpanes=0$/);
});
