/**
 * Secondary button component with a darker variant of the brand color.
 * Used for secondary actions where less visual emphasis is needed.
 */
import React from "react";

interface SecondaryButtonProps {
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  type = "button",
  className = "",
  children,
  onClick = () => {},
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-[#692871] hover:bg-[#551e5b] text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#692871] focus:border-[#692871] focus:ring-offset-2 mt-2 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
};
