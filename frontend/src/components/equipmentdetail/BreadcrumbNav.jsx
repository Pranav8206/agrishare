import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function BreadcrumbNav({ equipmentName }) {
  return (
    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
      <Link href="/" className="cursor-pointer hover:text-green-600">
        Home
      </Link>
      <ChevronRight size={14} />
      <Link href="/browse" className="cursor-pointer hover:text-green-600">
        Browse Equipment
      </Link>
      <ChevronRight size={14} />
      <span className="font-medium text-gray-900">{equipmentName}</span>
    </div>
  );
}
