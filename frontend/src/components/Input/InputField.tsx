import React from "react";

interface InputFieldProps {
  type: string;
  placeholder: string;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  placeholder,
  name,
  onChange,
  value,
  required = false,
}) => {
  return (
    <div className="relative flex-1">
      <input
        type={type}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        value={value}
        required={required}
        className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c549d4] focus:border-[#c549d4]"
      />
    </div>
  );
};

export default InputField;
