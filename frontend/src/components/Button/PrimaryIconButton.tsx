import React from "react";

interface PrimaryIconButtonProps {
  type: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const PrimaryIconButton: React.FC<PrimaryIconButtonProps> = ({
  type,
  className = "",
  disabled = false,
  children,
  icon,
  onClick = () => {},
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`w-full bg-[#c549d4] hover:bg-[#b23abc] text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] focus:ring-offset-2 mt-2 cursor-pointer flex items-center justify-center gap-2 ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
