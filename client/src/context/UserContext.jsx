import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext({
  user: null,
  token: null,
  profileComplete: false,
  profileStatus: "pending",
  completedSteps: [],
  login: () => {},
  logout: () => {},
  updateProfileStatus: () => {},
  updateCompletedSteps: () => {},
});

const safeParse = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => safeParse("user"));
  const [token, setToken] = useState(() => safeParse("token"));
  const [profileStatus, setProfileStatus] = useState(() => {
    return localStorage.getItem("profileStatus") || "pending";
  });
  const [completedSteps, setCompletedSteps] = useState(
    () => safeParse("completedSteps") || []
  );
  const [profileComplete, setProfileComplete] = useState(
    profileStatus === "approved"
  );

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("token", JSON.stringify(token));
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    setProfileComplete(profileStatus === "approved");
    localStorage.setItem("profileStatus", profileStatus);
  }, [profileStatus]);

  useEffect(() => {
    localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  const login = (userData) => {
    setUser(userData.user);
    setToken(userData.token);
    setProfileStatus(userData.profileStatus || "pending");
    setCompletedSteps(userData.completedSteps || []);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setProfileStatus("pending");
    setCompletedSteps([]);
    localStorage.clear();
  };

  const updateProfileStatus = (newStatus) => {
    setProfileStatus(newStatus);
    localStorage.setItem("profileStatus", newStatus);
  };

  const updateCompletedSteps = (step) => {
    if (!completedSteps.includes(step)) {
      const updatedSteps = [...completedSteps, step];
      setCompletedSteps(updatedSteps);
    }
  };

  const approveProfile = () => {
    updateProfileStatus("approved");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        profileComplete,
        profileStatus,
        completedSteps,
        login,
        logout,
        updateProfileStatus,
        updateCompletedSteps,
        approveProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
