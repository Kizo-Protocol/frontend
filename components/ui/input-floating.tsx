import { CheckIcon, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type InputFloatingProps = {
  id: string;
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  isValid?: boolean | null;
  error?: boolean;
  errorMessage?: string;
};

export const InputFloating = ({
  id,
  label,
  type = "text",
  value = "",
  onChange,
  disabled = false,
  className = "",
  isValid = null,
  error = false,
  errorMessage = "",
}: InputFloatingProps) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const hasValue = value && value.length > 0;
  const isPasswordType = type === "password";
  const inputType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  const hasPasswordToggle = isPasswordType;
  const iconRightPosition = hasPasswordToggle ? "right-12" : "right-3";

  return (
    <div
      className={`group flex flex-col w-full ${disabled ? "opacity-60" : ""} ${className}`}
    >
      <div
        className={`relative w-full inline-flex rounded-xl transition-colors h-14 py-1.5 px-3
          ${focused ? "border-1 border-blue-500 bg-white" : "border-1 border-gray-200 hover:bg-gray-50"}
        `}
      >
        <label
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm transition-all duration-200
            ${focused || hasValue ? "text-xs -translate-y-4 text-gray-300" : ""}
          `}
          htmlFor={id}
        >
          {label}
        </label>

        <input
          className="w-full bg-transparent text-black text-sm outline-none pt-4 rounded-sm pr-10"
          disabled={disabled}
          id={id}
          type={inputType}
          value={value}
          onBlur={handleBlur}
          onChange={onChange}
          onFocus={handleFocus}
        />

        {hasPasswordToggle && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
            disabled={disabled}
            type="button"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}

        {isValid === true && (
          <div
            className={`absolute ${iconRightPosition} top-1/2 transform -translate-y-1/2`}
          >
            <CheckIcon className="h-4 w-4 text-green-500" />
          </div>
        )}

        {error && (
          <div
            className={`absolute ${iconRightPosition} top-1/2 transform -translate-y-1/2`}
          >
            <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
      )}
    </div>
  );
};
