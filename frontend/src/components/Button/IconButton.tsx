import React from "react";

/**
 * Props for the IconButton component
 * @interface IconButtonProps
 * @property {React.ReactNode} icon - The icon to display in the button
 * @property {() => void} [onClick] - Function to execute when button is clicked
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {boolean} [disabled] - Whether the button is disabled
 */
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * IconButton component
 *
 * A rounded button that displays an icon with gray styling
 *
 * @param {IconButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onClick = () => {},
  className = "",
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full text-gray-400 hover:bg-gray-400 hover:text-gray-900 cursor-pointer transition ${className}`}
    >
      {icon}
    </button>
  );
};
