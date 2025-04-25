import React from "react";

/**
 * Props for the Header component
 * @interface HeaderProps
 * @property {string} text - The title text to display
 * @property {string} [className] - Additional CSS classes to apply to the header
 */
interface HeaderProps {
  text: string;
  className?: string;
}

/**
 * Header component
 *
 * A component for displaying page titles and section headers
 *
 * @param {HeaderProps} props - Component props
 * @returns {JSX.Element} - Rendered component
 */
export const Header: React.FC<HeaderProps> = ({ text, className = "" }) => {
  return <h1 className={`text-2xl font-bold mb-1 ${className}`}>{text}</h1>;
};
