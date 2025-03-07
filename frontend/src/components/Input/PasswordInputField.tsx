import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PasswordInputFieldProps {
  placeholder?: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
  icon: React.ReactNode;
}

const PasswordInputField: React.FC<PasswordInputFieldProps> = ({
  placeholder = "Password",
  name,
  onChange,
  value,
  required = false,
  icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        className="pl-10 pr-10 py-2 w-full border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-gray-400 hover:text-gray-500 focus:outline-none"
        >
          {showPassword ? (
            <FaEyeSlash className="h-5 w-5" />
          ) : (
            <FaEye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInputField;
