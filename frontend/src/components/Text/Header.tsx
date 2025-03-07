import React from "react";

interface HeaderProps {
  text: string;
}

const Header: React.FC<HeaderProps> = ({ text }) => {
  return <h1 className="text-2xl font-bold mb-1">{text}</h1>;
};

export default Header;
