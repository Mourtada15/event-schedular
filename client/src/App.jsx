import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppNavbar from './components/AppNavbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EventFormPage from './pages/EventFormPage.jsx';
import EventDetailsPage from './pages/EventDetailsPage.jsx';
import InvitationsPage from './pages/InvitationsPage.jsx';
import AcceptInvitePage from './pages/AcceptInvitePage.jsx';
import ToastViewport from './components/ToastViewport.jsx';

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="min-vh-100 bg-light">
      <AppNavbar />
      <main className={isAuthRoute ? 'container-fluid py-3 px-md-4' : 'container py-4'}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage mode="register" />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/new"
            element={
              <ProtectedRoute>
                <EventFormPage mode="create" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id/edit"
            element={
              <ProtectedRoute>
                <EventFormPage mode="edit" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invites"
            element={
              <ProtectedRoute>
                <InvitationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ToastViewport />
    </div>
  );
}
