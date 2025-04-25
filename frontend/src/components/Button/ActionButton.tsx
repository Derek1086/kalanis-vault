import React from "react";

/**
 * Props for the ActionButton component
 * @interface ActionButtonProps
 * @property {React.ReactNode} icon - The icon to display in the button
 * @property {() => void} [onClick] - Function to execute when button is clicked
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {boolean} [disabled] - Whether the button is disabled
 */
interface ActionButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * ActionButton component
 *
 * A button component that displays an icon with a purple background
 *
 * @param {ActionButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
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
      className={`p-2 rounded-md text-white bg-[#c549d4] hover:bg-white hover:text-[#c549d4] cursor-pointer transition ${className}`}
    >
      {icon}
    </button>
  );
};
