import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/ui/ToastContainer";
import { ThemeProvider } from "./contexts/ThemeContext";
import Verify from "./pages/Verify";
import DownloadFile from "./pages/DownloadFile";
import NotFound from "./pages/NotFound";
import LinkNotFound from "./pages/LinkNotFound";
import LinkExpired from "./pages/LinkExpired";
import FileStatsPage from "./components/dashboard/FileStatsPage";
import MaxScansReached from "./pages/MaxScansReached";
import ProtectedQR from "./pages/ProtectedQR";
import ShowText from "./pages/ShowText";
import NotSupported from "./pages/NotSupported";
import IncompletePage from "./pages/IncompletePage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PageLayout from "./pages/PageLayout";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import 'react-quill/dist/quill.snow.css';
import './styles/quill-custom.css';
import PostPage from "./pages/PostPage";
import PostsPage from "./pages/PostsPage";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin/*" element={<AdminDashboard />} />
              <Route
                path="/"
                element={
                  <PageLayout>
                    <LandingPage />
                  </PageLayout>
                }
              />
              <Route
                path="/features"
                element={
                  <PageLayout>
                    <FeaturesPage />
                  </PageLayout>
                }
              />
              <Route
                path="/pricing"
                element={
                  <PageLayout>
                    <PricingPage />
                  </PageLayout>
                }
              />
              <Route
                path="/about"
                element={
                  <PageLayout>
                    <AboutPage />
                  </PageLayout>
                }
              />
              <Route
                path="/contact"
                element={
                  <PageLayout>
                    <ContactPage />
                  </PageLayout>
                }
              />
              <Route
                path="/privacy"
                element={
                  <PageLayout>
                    <PrivacyPage />
                  </PageLayout>
                }
              />
              <Route
                path="/terms"
                element={
                  <PageLayout>
                    <TermsPage />
                  </PageLayout>
                }
              />
              <Route
                path="/posts"
                element={
                  <PageLayout>
                    <PostsPage />
                  </PageLayout>
                }
              />
              <Route
                path="/posts/:slug"
                element={
                  <PageLayout>
                    <PostPage />
                  </PageLayout>
                }
              />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/password_reset" element={<ResetPassword />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/incomplete" element={<IncompletePage />} />
              <Route path="/max-scans-reached" element={<MaxScansReached />} />
              <Route path="/protected/:identifier" element={<ProtectedQR />} />
              <Route path="/show-text/:identifier" element={<ShowText />} />
              <Route path="/not-supported" element={<NotSupported />} />
              <Route path="/telechargement/:code" element={<DownloadFile />} />
              <Route path="/link-not-found" element={<LinkNotFound />} />
              <Route path="/link-expired" element={<LinkExpired />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer />
          </Router>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
