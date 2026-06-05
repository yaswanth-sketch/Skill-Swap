import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import NetworkBackground from './components/NetworkBackground';
import Navbar from './components/Navbar';
import AIChatBot from './components/AIChatBot';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TopicsPage from './pages/TopicsPage';
import TopicPromptPage from './pages/TopicPromptPage';
import TeachDashboard from './pages/TeachDashboard';
import LearnDashboard from './pages/LearnDashboard';
import VideoPlayerPage from './pages/VideoPlayerPage';
import SkillDetailPage from './pages/SkillDetailPage';
import SessionsPage from './pages/SessionsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'admin' ? children : <Navigate to="/" />;
}

import AnalyticsPage from './pages/AnalyticsPage';
import QuizPage from './pages/QuizPage';
import NotificationsPage from './pages/NotificationsPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      <NetworkBackground />
      {user && <Navbar />}
      {user && <AIChatBot />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><TopicsPage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/topic/:topicName/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/topic/:topicName" element={<ProtectedRoute><TopicPromptPage /></ProtectedRoute>} />
        <Route path="/topic/:topicName/teach" element={<ProtectedRoute><TeachDashboard /></ProtectedRoute>} />
        <Route path="/topic/:topicName/learn" element={<ProtectedRoute><LearnDashboard /></ProtectedRoute>} />
        <Route path="/video/:id" element={<ProtectedRoute><VideoPlayerPage /></ProtectedRoute>} />
        <Route path="/skill/:id" element={<ProtectedRoute><SkillDetailPage /></ProtectedRoute>} />
        <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}
