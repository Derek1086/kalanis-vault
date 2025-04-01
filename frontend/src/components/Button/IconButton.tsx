/**
 * A simple icon button component with hover state.
 * Used for interface actions represented by icons.
 */
import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick = () => {},
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-full text-gray-400 hover:bg-gray-400 hover:text-gray-900 cursor-pointer transition ${className}`}
    >
      {icon}
    </button>
  );
};
