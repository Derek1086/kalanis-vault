import React from "react";

/**
 * Props for the PrimaryIconButton component
 * @interface PrimaryIconButtonProps
 * @property {"button" | "submit" | "reset"} type - The button type attribute
 * @property {string} [className] - Additional CSS classes to apply to the button
 * @property {boolean} [disabled] - Whether the button is disabled
 * @property {React.ReactNode} children - The content to render inside the button
 * @property {React.ReactNode} icon - The icon to display in the button
 * @property {(e: React.MouseEvent<HTMLButtonElement>) => void} [onClick] - Function to execute when button is clicked
 */
interface PrimaryIconButtonProps {
  type: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * PrimaryIconButton component
 *
 * A primary styled button with purple background that includes an icon and text
 *
 * @param {PrimaryIconButtonProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
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
      className={`w-full bg-[#c549d4] hover:bg-[#b23abc] font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] focus:ring-offset-2 mt-2 cursor-pointer flex items-center justify-center gap-2 ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
