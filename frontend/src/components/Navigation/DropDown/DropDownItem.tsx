import React from "react";

interface DropDownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const DropDownItem: React.FC<DropDownItemProps> = ({
  children,
  onClick = () => {},
  className = "",
  disabled = false,
  icon,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
          w-[calc(100%-12px)] mx-1.5 text-left px-2 py-2 text-sm focus:bg-gray-400 
          focus:outline-none transition-colors flex hover:bg-gray-400 hover:text-gray-900
          ${disabled ? "text-gray-400 cursor-not-allowed" : "cursor-pointer"}
          ${className || ""}
          rounded-md
        `}
    >
      {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
