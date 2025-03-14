import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
}

export const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl shadow-lg overflow-hidden bg-[#151316]">
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};
