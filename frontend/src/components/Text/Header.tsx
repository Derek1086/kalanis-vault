import React from "react";

interface HeaderProps {
  text: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ text, className = "" }) => {
  return <h1 className={`text-2xl font-bold mb-1 ${className}`}>{text}</h1>;
};
