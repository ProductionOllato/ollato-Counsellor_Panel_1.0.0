import { Suspense, lazy, useState } from "react";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useRouteError,
} from "react-router-dom";

import { UserProvider } from "./context/UserContext.jsx";
import { NotificationProvider } from "./context/NotificationContext";
import { useAuth } from "./context/UserContext.jsx";

const Registration = lazy(() => import("./pages/Registration"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./components/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Layout = lazy(() => import("./Layout"));
const RegistrationDetails = lazy(() =>
  import("./pages/RegistrationDetails.jsx")
);
const SupportForm = lazy(() => import("./components/SupportForm.jsx"));
const AvailabilityManagements = lazy(() =>
  import("./pages/AvailabilityManagements.jsx")
);
const SessionManagement = lazy(() => import("./pages/SessionManagement.jsx"));
const MyActivity = lazy(() => import("./pages/MyActivity.jsx"));
const RevenueDetails = lazy(() => import("./pages/RevenueDetails.jsx"));
const AccountSettings = lazy(() => import("./pages/AccountSettings.jsx"));
const ResetPassword = lazy(() => import("./components/ResetPassword.jsx"));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="loader" />
    <p className="mt-4 text-center font-bold text-2xl">Loading...</p>
  </div>
);

function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page" className="text-center">
      <h1 className="text-2xl">Oops!</h1>
      <p className="text-lg">Sorry, an unexpected error has occurred.</p>
      <p className="text-lg">
        <i className="font-semibold">{error.statusText || error.message}</i>
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl text-center font-bold mb-4">404</h1>
      <h2 className="text-2xl text-center mb-4">Page Not Found</h2>
      <p className="text-center text-lg mb-8">
        The page you are looking for does not exist.
      </p>
      <button className="bg-[#1E3E62] hover:bg-[#4272aa] text-white font-bold py-2 px-4 rounded">
        <a href="/dashboard" className="no-underline hover:text-gray-200">
          Go Back
        </a>
      </button>
    </div>
  );
}

function App() {
  const PrivateRoute = ({ children }) => {
    const { user, token } = useAuth();
    if (!user || !token) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <>
      <UserProvider>
        <NotificationProvider>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* public routes */}
                <Route
                  path="/"
                  element={<Login />}
                  errorElement={<ErrorBoundary />}
                />
                <Route
                  path="/registration"
                  element={<Registration />}
                  errorElement={<ErrorBoundary />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
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
                  errorElement={<ErrorBoundary />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificationProvider>
      </UserProvider>
    </>
  );
}

export default App;
