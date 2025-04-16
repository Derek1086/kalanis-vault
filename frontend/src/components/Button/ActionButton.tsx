import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onClick = () => {},
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-4 rounded-full text-white bg-[#c549d4] hover:bg-white hover:text-[#c549d4] cursor-pointer transition ${className}`}
    >
      {icon}
    </button>
  );
};
