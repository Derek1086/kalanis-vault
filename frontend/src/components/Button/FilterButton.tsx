import React from "react";

/**
 * Props for the FilterButton component
 * @interface FilterButtonProps
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {string} title - The text displayed inside the button
 * @property {boolean} active - Whether the button is in an active (highlighted) state
 * @property {(e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>} [onClick] - Function to execute when button is clicked
 */
interface FilterButtonProps {
  className?: string;
  title: string;
  active: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
}

/**
 * FilterButton component
 *
 * A toggle-style button with conditional background based on its active state
 *
 * @param {FilterButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const FilterButton: React.FC<FilterButtonProps> = ({
  className = "",
  title,
  active,
  onClick = () => {},
}) => {
  const bgColor = active
    ? "bg-[#c549d4] hover:bg-[#b23abc]"
    : "bg-[#151316] hover:bg-[#2a272d]";

  return (
    <button
      onClick={onClick}
      className={`${bgColor} text-white font-medium py-2.5 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] focus:ring-offset-2 mt-2 cursor-pointer flex items-center justify-center ${className}`}
    >
      {title}
    </button>
  );
};
