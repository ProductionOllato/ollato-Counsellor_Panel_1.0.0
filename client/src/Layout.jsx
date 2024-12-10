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

import React, { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto bg-gray-100 p-6 pt-10 scrollbar-custom transition-all duration-300"
          style={{
            marginLeft: sidebarOpen ? "16rem" : "5rem", // Sidebar adjustment
            marginTop: "5rem", // Space below fixed header
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
