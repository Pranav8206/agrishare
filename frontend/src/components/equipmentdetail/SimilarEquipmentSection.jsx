import { Truck } from "lucide-react";

export default function SimilarEquipmentSection({
  loadingSimilarEquipments,
  similarEquipments,
  similarFallbackUsed,
  formatCurrency,
  onViewDetails,
}) {
  return (
    <div className="my-5 rounded-3xl border border-border-light bg-surface p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
        <Truck size={18} className="text-text-secondary" />
        Similar Equipment
      </h3>
      {loadingSimilarEquipments ? (
        <p className="text-sm text-text-tertiary">Finding similar equipment...</p>
      ) : similarEquipments.length === 0 ? (
        <p className="text-sm text-text-tertiary">No related equipment available right now.</p>
      ) : (
        <>
          {similarFallbackUsed && (
            <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
              Same-type equipment is unavailable, so showing best related options.
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {similarEquipments.map((item) => (
              <div
                key={item?._id}
                className="group overflow-hidden rounded-2xl border border-border-light bg-background transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                {item?.coverImage ? (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={item.coverImage}
                      alt={item?.name || "Equipment"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/35 to-transparent" />
                  </div>
                ) : null}
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-text-primary">{item?.name || "Equipment"}</p>
                  <p className="mt-1 text-xs text-text-tertiary">{item?.type || "General"}</p>
                  <p className="mt-2 text-base font-bold text-primary-accent">
                    {formatCurrency(item?.pricePerDay || 0)} / day
                  </p>
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center rounded-lg border border-border-light px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition hover:bg-background-hover"
                    onClick={() => onViewDetails(item?._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
