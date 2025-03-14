import React from "react";

interface SubtitleProps {
  text: string;
}

export const Subtitle: React.FC<SubtitleProps> = ({ text }) => {
  return <p className="text-sm text-center">{text}</p>;
};
