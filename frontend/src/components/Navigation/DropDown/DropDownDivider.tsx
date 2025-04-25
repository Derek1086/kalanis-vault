import React from "react";

/**
 * Props for the DropDownDivider component
 * @interface DropDownDividerProps
 * @property {string} [className] - Additional CSS classes to apply to the divider
 */
interface DropDownDividerProps {
  className?: string;
}

/**
 * DropDownDivider component
 *
 * A horizontal divider line used to separate sections in dropdown menus
 *
 * @param {DropDownDividerProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const DropDownDivider: React.FC<DropDownDividerProps> = ({
  className,
}) => {
  return (
    <div className={`my-1 mx-2 border-t border-gray-400 ${className || ""}`} />
  );
};
