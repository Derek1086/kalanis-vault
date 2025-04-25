import React from "react";

/**
 * Props for the DropDownItem component
 * @interface DropDownItemProps
 * @property {React.ReactNode} children - Content to display within the dropdown item
 * @property {() => void} [onClick] - Function to execute when item is clicked
 * @property {string} [className] - Additional CSS classes to apply to the item
 * @property {boolean} [disabled] - Whether the item is disabled
 * @property {React.ReactNode} [icon] - Optional icon to display before the item content
 */
interface DropDownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * DropDownItem component
 *
 * An interactive item within a dropdown menu that can be clicked
 * Supports optional icon display and disabled state
 *
 * @param {DropDownItemProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
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
