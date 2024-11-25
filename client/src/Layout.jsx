import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="layout flex h-screen">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="layout-content flex-1 flex flex-col">
        <Header />
        <main
          className={`layout-main flex-1 overflow-y-auto p-6 pt-10 bg-gray-100 scrollbar-custom transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
