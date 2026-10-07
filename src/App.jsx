import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import ErrorBoundary from './components/layout/ErrorBoundary';
import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/ui/ScrollToTop';

// Pages
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const Discovery = lazy(() => import('./pages/Discovery'));
const Matches = lazy(() => import('./pages/Matches'));
const Chat = lazy(() => import('./pages/Chat'));
const Lounge = lazy(() => import('./pages/Lounge'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const PostDetail = lazy(() => import('./pages/PostDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const MemberProfile = lazy(() => import('./pages/MemberProfile'));
const ProfileEdit = lazy(() => import('./pages/ProfileEdit'));
const Verification = lazy(() => import('./pages/Verification'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Legal = lazy(() => import('./pages/Legal'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const News = lazy(() => import('./pages/News'));
const NewsDetail = lazy(() => import('./pages/NewsDetail'));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="font-serif text-sm font-medium text-muted">Loading CA2gether...</p>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/discover" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuthContext();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/discover" replace />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Member routes */}
        <Route
          path="/profile/setup"
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          }
        />
        {/* Backwards-compatible alias for links created by older onboarding builds. */}
        <Route path="/profile-setup" element={<Navigate to="/profile/setup" replace />} />
        <Route
          path="/discover"
          element={
            <ProtectedRoute>
              <Discovery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <ProtectedRoute>
              <Matches />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:matchId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news"
          element={
            <ProtectedRoute>
              <News />
            </ProtectedRoute>
          }
        />
        <Route
          path="/news/:id"
          element={
            <ProtectedRoute>
              <NewsDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lounge"
          element={
            <ProtectedRoute>
              <Lounge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lounge/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lounge/create-event"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <ProtectedRoute>
              <PostDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <MemberProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verification"
          element={
            <ProtectedRoute>
              <Verification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route path="/terms" element={<Legal type="terms" />} />
        <Route path="/privacy" element={<Legal type="privacy" />} />

        {/* Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      <ScrollToTop />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#FFFCF8',
                color: '#2D2A26',
                border: '1.5px solid #EDE3D8',
                borderRadius: '20px',
                fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                fontSize: '0.875rem',
                boxShadow: '0 4px 16px rgba(217, 105, 74, 0.1)',
                padding: '12px 18px',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
