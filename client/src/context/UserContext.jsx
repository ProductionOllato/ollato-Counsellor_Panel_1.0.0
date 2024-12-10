import React, { createContext, useState, useContext, useEffect } from "react";

// Create the User Context
const UserContext = createContext({
  user: null,
  profileComplete: false,
  profileStatus: "pending",
  completedSteps: [],
  login: () => {},
  logout: () => {},
  updateProfileStatus: () => {},
  updateCompletedSteps: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // three options: "pending",waiting_approval ,"approved" for profileStatus
  const [profileStatus, setProfileStatus] = useState(() => {
    return localStorage.getItem("profileStatus") || "pending";
  });

  // completedSteps is an array of strings representing completed steps in the registration process
  const [completedSteps, setCompletedSteps] = useState(() => {
    const storedSteps = localStorage.getItem("completedSteps");
    return storedSteps ? JSON.parse(storedSteps) : [];
  });

  // profileComplete is a boolean indicating whether the user's profile is complete
  const [profileComplete, setProfileComplete] = useState(() => {
    return profileStatus === "approved";
  });

  // const isDashboardAccessible =
  //   profileStatus === "approved" &&
  //   completedSteps.includes("emailVerified") &&
  //   completedSteps.includes("phoneVerified");

  //helper functions to update states - testing
  const approveProfile = () => {
    updateProfileStatus("approved");
  };

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    setProfileComplete(profileStatus === "approved");
    localStorage.setItem("profileStatus", profileStatus);
  }, [profileStatus]);

  useEffect(() => {
    localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  const login = (user) => {
    // if (!user || !user.profileStatus) {
    //   console.error("Invalid user object in login:", user);
    //   return;
    // }

    setUser(user);
    setProfileStatus(user.profileStatus || "pending");
    setCompletedSteps(user.completedSteps || []);
  };

  const logout = () => {
    setUser(null);
    setProfileComplete(false);
    setProfileStatus("incomplete");
    setCompletedSteps([]);
    localStorage.removeItem("user");
    localStorage.removeItem("completedSteps");
    localStorage.removeItem("profileStatus");
  };

  const updateProfileStatus = (newStatus) => {
    setProfileStatus(newStatus);
    if (newStatus === "approved") {
      setProfileComplete(true);
    } else {
      setProfileComplete(false);
    }
    localStorage.setItem("profileStatus", newStatus);
  };

  const updateCompletedSteps = (step) => {
    if (!completedSteps.includes(step)) {
      const updatedSteps = [...completedSteps, step];
      setCompletedSteps(updatedSteps);
      localStorage.setItem("completedSteps", JSON.stringify(updatedSteps));
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profileComplete,
        profileStatus,
        completedSteps,
        login,
        logout,
        updateProfileStatus,
        updateCompletedSteps,
        approveProfile, //testing - will be removed
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
