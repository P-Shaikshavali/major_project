import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintList from './pages/ComplaintList';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminAnalytics from './pages/AdminAnalytics';
import FacultyDashboard from './pages/FacultyDashboard';
import DashboardLayout from './components/Layout/DashboardLayout';
import SmartChatbot from './components/Chatbot/SmartChatbot';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard/student" replace />} />
            <Route path="student"    element={<StudentDashboard />} />
            <Route path="profile"    element={<StudentProfile />} />
            <Route path="submit"     element={<SubmitComplaint />} />
            <Route path="list"       element={<ComplaintList />} />
            <Route path="faculty"    element={<FacultyDashboard />} />
            <Route path="authority"  element={<AuthorityDashboard />} />
            <Route path="admin"      element={<AdminAnalytics />} />
          </Route>
        </Routes>
        <SmartChatbot />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
