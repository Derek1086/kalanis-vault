import React from "react";

interface DropDownDividerProps {
  className?: string;
}

export const DropDownDivider: React.FC<DropDownDividerProps> = ({
  className,
}) => {
  return (
    <div className={`my-1 mx-2 border-t border-gray-400 ${className || ""}`} />
  );
};
