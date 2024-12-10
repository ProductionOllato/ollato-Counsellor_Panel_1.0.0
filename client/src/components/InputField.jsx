import React from "react";
const InputField = ({
  label,
  type = "text",
  name,
  placeholder,
  handleChange,
  value,
  options = [],
  component = "input",
  ...props
}) => (
  <div className="mb-4 flex flex-col">
    <label htmlFor={name} className="block text-[#2C394B]">
      {label}
      {props.required && "*"}
    </label>
    {type === "checkbox" && options.length > 0 ? (
      <div className="flex flex-col">
        {options.map((option, index) => (
          <label key={index} className="inline-flex items-center mt-1">
            <input
              type="checkbox"
              name={name}
              value={option}
              onChange={handleChange}
              className="mr-2"
            />
            {option}
          </label>
        ))}
      </div>
    ) : (
      React.createElement(component, {
        id: name,
        type,
        name,
        placeholder,
        value,
        onChange: handleChange,
        className: "w-full p-2 border border-gray-300 rounded-md",
        ...props,
      })
    )}
  </div>
);

export default InputField;
