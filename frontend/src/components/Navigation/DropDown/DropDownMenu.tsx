import React, { ReactNode } from "react";

/**
 * Props for the DropDownMenu component
 * @interface DropDownMenuProps
 * @property {ReactNode} children - The dropdown menu items to render
 */
interface DropDownMenuProps {
  children: ReactNode;
}

/**
 * DropDownMenu component
 *
 * A container for dropdown menu items that positions them below a trigger element
 *
 * @param {DropDownMenuProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const DropDownMenu: React.FC<DropDownMenuProps> = ({ children }) => {
  return (
    <div className="bg-[#242424] absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10">
      {children}
    </div>
  );
};
