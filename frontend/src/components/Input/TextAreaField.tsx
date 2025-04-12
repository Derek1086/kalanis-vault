import React from "react";

interface TextAreaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxCharacters?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  className = "",
  maxCharacters,
  ...props
}) => {
  return (
    <div className="relative flex-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        maxLength={maxCharacters}
        className={`px-3 py-2 w-full border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4] ${className}`}
        {...props}
      />
    </div>
  );
};
