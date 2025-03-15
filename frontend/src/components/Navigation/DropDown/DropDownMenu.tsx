/**
 * Card component that provides a centered container for content.
 * Creates a floating card effect with background and shadow.
 */
import React, { ReactNode } from "react";

interface DropDownMenuProps {
  children: ReactNode;
}

export const DropDownMenu: React.FC<DropDownMenuProps> = ({ children }) => {
  return (
    <div className="bg-[#242424] absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10">
      {children}
    </div>
  );
};
