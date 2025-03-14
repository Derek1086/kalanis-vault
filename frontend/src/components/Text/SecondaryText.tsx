import React from "react";

interface SecondaryTextProps {
  text: string;
  className?: string;
}

export const SecondaryText: React.FC<SecondaryTextProps> = ({
  text,
  className = "",
}) => {
  return <p className={`text-sm ${className}`}>{text}</p>;
};
