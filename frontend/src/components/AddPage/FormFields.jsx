import { useTranslation } from "react-i18next";
import Icon from "@/Components/AddPage/Icon";

function FieldLabel({ children, optional }) {
  const { t } = useTranslation();

  return (
    <label className="block text-sm font-bold text-gray-800 mb-1.5">
      {children}
      {optional && (
        <span className="text-xs font-normal text-gray-400 ml-1">
          ({t("add.optional")})
        </span>
      )}
    </label>
  );
}

function InputField({ label, icon, optional, error, ...props }) {
  return (
    <div>
      {label && <FieldLabel optional={optional}>{label}</FieldLabel>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon path={icon} className="w-4 h-4" />
          </span>
        )}
        <input
          {...props}
          className={`w-full border rounded-xl py-2.5 text-sm text-gray-800 bg-white
            focus:outline-none focus:ring-2 focus:ring-primary-accent focus:border-transparent
            transition-all placeholder:text-gray-400
            ${icon ? "pl-9 pr-4" : "px-4"}
            ${error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, icon, optional, children, error, ...props }) {
  return (
    <div>
      {label && <FieldLabel optional={optional}>{label}</FieldLabel>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
            <Icon path={icon} className="w-4 h-4" />
          </span>
        )}
        <select
          {...props}
          className={`w-full appearance-none cursor-pointer rounded-xl border py-2.5 text-sm font-medium text-gray-800 bg-white shadow-sm
            focus:outline-none focus:ring-2 focus:ring-primary-accent/25 focus:border-primary-accent
            transition-all duration-200
            ${icon ? "pl-9 pr-8" : "px-4 pr-8"}
            ${error ? "border-red-400 bg-red-50" : "border-gray-200 hover:border-primary-accent/45"}`}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-3.5 h-3.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export { FieldLabel, InputField, SelectField };
