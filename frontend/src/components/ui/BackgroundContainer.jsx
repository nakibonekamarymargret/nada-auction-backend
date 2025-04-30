import React from "react";

const BackgroundContainer = ({ children }) => {
  return (
    <div
      className="min-h-screen overflow-hidden p-4 bg-no-repeat bg-cover bg-top bg-center overlay"
      style={{ backgroundImage: "url('/bg3.jpeg')" }}
    >
      <div className="flex items-center justify-center w-full h-screen">
        {children}
      </div>
    </div>
  );
};

export default BackgroundContainer;
