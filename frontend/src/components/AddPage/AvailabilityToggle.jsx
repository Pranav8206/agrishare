import { useTranslation } from "react-i18next";
import { FieldLabel } from "@/Components/AddPage/FormFields";

export default function AvailabilityToggle({ value, onChange }) {
  const { t } = useTranslation();

  const options = [
    { label: t("add.available"), value: true },
    { label: t("add.notAvailable"), value: false },
  ];

  return (
    <div>
      <FieldLabel>{t("add.availabilityStatus")}</FieldLabel>
      <div className="flex rounded-xl border border-gray-200 overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-2.5 text-sm font-bold transition-all
              ${
                value === opt.value
                  ? opt.value
                    ? "bg-green-500 text-white shadow-inner"
                    : "bg-red-400 text-white shadow-inner"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
          >
            {opt.value ? "✓ " : "✗ "}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
