import React from "react";

interface IconInputFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
  icon: React.ReactNode;
}

const IconInputField: React.FC<IconInputFieldProps> = ({
  type,
  placeholder,
  name,
  onChange,
  value,
  required = false,
  icon,
}) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        className="pl-10 pr-3 py-2 w-full border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
    </div>
  );
};

export default IconInputField;
