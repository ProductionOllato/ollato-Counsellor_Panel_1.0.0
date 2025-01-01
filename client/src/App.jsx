import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { UserProvider } from "./context/UserContext.jsx";
import { NotificationProvider } from "./context/NotificationContext";
import { useAuth } from "./context/UserContext.jsx";

import Registration from "./pages/Registration";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Layout from "./Layout";
import ErrorPage from "./error-page.jsx";
import RegistrationDetails from "./pages/RegistrationDetails.jsx";
import SupportForm from "./components/SupportForm.jsx";
import AvailabilityManagements from "./pages/AvailabilityManagements.jsx";
import SessionManagement from "./pages/SessionManagement.jsx";
import MyActivity from "./pages/MyActivity.jsx";
import RevenueDetails from "./pages/RevenueDetails.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import ConfirmationDialog from "./components/ConfirmationDialog.jsx";
function App() {
  // console.log(import.meta.env.VITE_PERSONAL_DELAILS_API);

  const PrivateRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
      return <Navigate to="/" replace />;
    }

    return children;
  };

  return (
    <>
      <UserProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* public routes */}
              <Route path="/" element={<Login />} errorElement={<ErrorPage />} />
              <Route
                path="/registration"
                element={<Registration />}
                errorElement={<ErrorPage />}
              />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
                ErrorBoundary={ErrorBoundary}
              />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
                ErrorBoundary={ErrorBoundary}
              />

              {/* private routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/registration-complete"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RegistrationDetails />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/support"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SupportForm />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/availability-management"
                element={
                  <PrivateRoute>
                    <Layout>
                      <AvailabilityManagements />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/session-management"
                element={
                  <PrivateRoute>
                    <Layout>
                      <SessionManagement />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/my-activity"
                element={
                  <PrivateRoute>
                    <Layout>
                      <MyActivity />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/revenue-details"
                element={
                  <PrivateRoute>
                    <Layout>
                      <RevenueDetails />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
              <Route
                path="/account-settings"
                element={
                  <PrivateRoute>
                    <Layout>
                      <AccountSettings />
                    </Layout>
                  </PrivateRoute>
                }
                errorElement={<ErrorPage />}
              />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </UserProvider>
    </>
  );
}
function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return <div>{error.message}</div>;
}

export default App;
