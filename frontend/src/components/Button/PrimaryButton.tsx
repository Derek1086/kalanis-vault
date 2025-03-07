import React from "react";

interface PrimaryButtonProps {
  type: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  type,
  className = "",
  children,
}) => {
  return (
    <button
      type={type}
      className={`w-full bg-[#c549d4] hover:bg-[#b23abc] text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] focus:ring-offset-2 mt-2 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
