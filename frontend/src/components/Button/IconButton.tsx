import React from "react";

interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full text-gray-400 hover:bg-gray-400 hover:text-gray-900 cursor-pointer transition"
    >
      {icon}
    </button>
  );
};
