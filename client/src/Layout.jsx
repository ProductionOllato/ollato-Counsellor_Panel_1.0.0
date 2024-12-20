// import React, { useState } from "react";
// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";

// function Layout({ children }) {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   return (
//     <div className="layout flex h-screen">
//       <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//       <div className="layout-content flex-1 flex flex-col">
//         <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
//         <main
//           className={`layout-main flex-1 overflow-y-auto p-6 pt-10 bg-gray-100 scrollbar-custom transition-all duration-300 mt-16 ${
//             sidebarOpen ? "ml-64" : "ml-20"
//           }`}
//         >
//           {children}
//         </main>
//       </div>
//     </div>
//   );
// }

// export default Layout;

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect window width changes and set state accordingly
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767); // Check if the screen is below 767px
    };

    handleResize(); // Call on initial render
    window.addEventListener("resize", handleResize); // Add resize event listener

    return () => window.removeEventListener("resize", handleResize); // Cleanup on unmount
  }, []);

  return (
    <>
    <div className="flex h-screen overflow-auto">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div
        className={`${sidebarOpen ? "ml-64" : ""} ${
          isMobile ? "w-full" : "flex-1 flex flex-col"
        }`}
      >
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main className="flex-1 bg-gray-100 p-6 pt-20 overflow-auto scrollbar-custom transition-all duration-300 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}

export default Layout;
