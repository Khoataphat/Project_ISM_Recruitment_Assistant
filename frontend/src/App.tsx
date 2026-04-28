import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '@/context/AuthProvider'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import { AuthLayout } from '@/layouts/AuthLayout'
import { CandidateLayout } from '@/layouts/CandidateLayout.tsx'
import { HrLayout } from '@/layouts/HrLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { CandidateApplicationsPage } from '@/pages/candidate/CandidateApplicationsPage.tsx'
import { CandidateJobDetailsPage } from '@/pages/candidate/CandidateJobDetailsPage.tsx'
import { CandidateJobsPage } from '@/pages/candidate/CandidateJobsPage.tsx'
import { CandidateProfilePage } from '@/pages/candidate/CandidateProfilePage.tsx'
import { HrCandidateDetailsPage } from '@/pages/hr/HrCandidateDetailsPage'
import { HrCandidatesPage } from '@/pages/hr/HrCandidatesPage'
import { HrDashboardPage } from '@/pages/hr/HrDashboardPage'
import { HrJobDetailsPage } from '@/pages/hr/HrJobDetailsPage'
import { HrJobsPage } from '@/pages/hr/HrJobsPage'
import { HrMyJobPage } from '@/pages/hr/HrMyJobPage'
import { JobDetailsPage } from '@/pages/main/JobDetailsPage'
import { JobStatusPage } from '@/pages/main/JobStatusPage'
import { LandingPage } from '@/pages/main/LandingPage'
import { ListJobsPage } from '@/pages/main/ListJobsPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
        </Route>
        <Route path="main" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="jobs" element={<ListJobsPage />} />
          <Route path="job/:id" element={<JobDetailsPage />} />
          <Route path="job/:id/status" element={<JobStatusPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
          <Route path="hr" element={<HrLayout />}>
            <Route path="dashboard" element={<HrDashboardPage />} />
            <Route path="my-job" element={<HrMyJobPage />} />
            <Route path="jobs" element={<HrJobsPage />} />
            <Route path="job/:id" element={<HrJobDetailsPage />} />
            <Route path="candidates" element={<HrCandidatesPage />} />
            <Route path="candidate/:id" element={<HrCandidateDetailsPage />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['CANDIDATE']} />}>
          <Route path="candidate" element={<CandidateLayout />}>
            <Route path="jobs" element={<CandidateJobsPage />} />
            <Route path="applications" element={<CandidateApplicationsPage />} />
            <Route path="your-applications" element={<CandidateApplicationsPage />} />
            <Route path="profile" element={<CandidateProfilePage />} />
            <Route path="job/:id" element={<CandidateJobDetailsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
)

export default App
