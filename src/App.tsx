import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import StudentDashboard   from './pages/StudentDashboard';
import StudentProfile     from './pages/StudentProfile';
import SubmitComplaint    from './pages/SubmitComplaint';
import ComplaintList      from './pages/ComplaintList';
import FacultyDashboard   from './pages/FacultyDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import DeanDashboard      from './pages/DeanDashboard';
import HODDashboard       from './pages/HODDashboard';
import HostelDeanDashboard from './pages/HostelDeanDashboard';
import AdminAnalytics     from './pages/AdminAnalytics';
import WardenDashboard    from './pages/WardenDashboard';
import DashboardLayout    from './components/Layout/DashboardLayout';
import SmartChatbot       from './components/Chatbot/SmartChatbot';

// ── Protected Route Guard ────────────────────────────────────────────────────
// Redirects to /login if JWT token is missing. Also attaches token to every
// api call automatically via api.ts interceptor.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login?reason=session_expired" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/"      element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

<<<<<<< HEAD
          {/* Protected Dashboard Routes — JWT required */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard/student" replace />} />
=======
          {/* 🛡️ Protected Route Wrapper */}
          <Route 
            path="/dashboard" 
            element={localStorage.getItem('token') ? <DashboardLayout /> : <Navigate to="/login" replace />}
          >
            <Route index          element={<Navigate to="/dashboard/student" replace />} />
>>>>>>> 43f09aa (Fix grievance routing logic: category mapping, AI classification override, and exhaustive integration tests)

            {/* Student */}
            <Route path="student"   element={<StudentDashboard />} />
            <Route path="profile"   element={<StudentProfile />} />
            <Route path="submit"    element={<SubmitComplaint />} />
            <Route path="list"      element={<ComplaintList />} />

            {/* Faculty */}
            <Route path="faculty"   element={<FacultyDashboard />} />

            {/* Shared authority queue */}
            <Route path="authority" element={<AuthorityDashboard />} />

            {/* Dean */}
            <Route path="dean"      element={<DeanDashboard />} />

            {/* Hostel Dean / Warden */}
            <Route path="hosteldean" element={<HostelDeanDashboard />} />

            {/* HOD */}
            <Route path="hod"       element={<HODDashboard />} />

            {/* Warden - FULLY ISOLATED, separate from authority queue */}
            <Route path="warden"      element={<WardenDashboard />} />

            {/* Admin */}
            <Route path="admin"     element={<AdminAnalytics />} />
          </Route>

          {/* Catch-all — send unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global AI Chatbot FAB — visible on all pages */}
        <SmartChatbot />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
