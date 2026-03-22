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
import HostelDeanDashboard from './pages/HostelDeanDashboard';
import AdminAnalytics     from './pages/AdminAnalytics';
import DashboardLayout    from './components/Layout/DashboardLayout';
import SmartChatbot       from './components/Chatbot/SmartChatbot';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"      element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Routes — all roles under one DashboardLayout */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index          element={<Navigate to="/dashboard/student" replace />} />

            {/* Student */}
            <Route path="student"     element={<StudentDashboard />} />
            <Route path="profile"     element={<StudentProfile />} />
            <Route path="submit"      element={<SubmitComplaint />} />
            <Route path="list"        element={<ComplaintList />} />

            {/* Faculty */}
            <Route path="faculty"     element={<FacultyDashboard />} />

            {/* Shared authority queue (Faculty, Dean, HostelDean, Admin) */}
            <Route path="authority"   element={<AuthorityDashboard />} />

            {/* Dean */}
            <Route path="dean"        element={<DeanDashboard />} />

            {/* Hostel Dean */}
            <Route path="hosteldean"  element={<HostelDeanDashboard />} />

            {/* Admin */}
            <Route path="admin"       element={<AdminAnalytics />} />
          </Route>
        </Routes>

        {/* Global AI Chatbot FAB — visible on all pages */}
        <SmartChatbot />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
