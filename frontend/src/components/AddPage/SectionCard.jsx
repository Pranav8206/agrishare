import Icon from "@/components/AddPage/Icon";

export default function SectionCard({ icon, title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-gray-50">
        <div className="w-8 h-8 bg-primary-accent-light rounded-lg flex items-center justify-center shrink-0">
          <Icon path={icon} className="w-4 h-4 text-primary-accent" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
