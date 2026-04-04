import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

export default function ImageGallery({
  imageList,
  equipmentName,
  isEquipmentOwner,
  equipmentType,
  power,
  usageHours,
}) {
  const [selectedImage, setSelectedImage] = useState(imageList?.[0] || "");

  useEffect(() => {
    setSelectedImage(imageList?.[0] || "");
  }, [imageList]);

  const activeImage = selectedImage || imageList?.[0] || "";

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-[1px] border-gray-100 bg-white shadow-sm">
        <div className="relative">
          {isEquipmentOwner && (
            <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 shadow-sm">
              <Crown size={14} className="text-amber-600" />
              Your Equipment
            </div>
          )}

          {activeImage ? (
            <img
              src={activeImage}
              alt={equipmentName}
              className="h-96 w-full object-cover"
            />
          ) : (
            <div className="flex h-96 w-full items-center justify-center bg-gray-100 text-gray-400">
              No Image Available
            </div>
          )}
        </div>
      </div>

      {imageList.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {imageList.map((imageUrl, index) => {
            const isActive = imageUrl === activeImage;

            return (
              <img
                key={`${imageUrl}-${index}`}
                src={imageUrl}
                alt={`${equipmentName} ${index + 1}`}
                className={`h-24 w-24 cursor-pointer rounded-lg border-2 object-cover transition-all hover:scale-105 ${
                  isActive
                    ? "border-green-500 shadow-md"
                    : "border-gray-200 hover:border-green-400"
                }`}
                onClick={() => setSelectedImage(imageUrl)}
              />
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-[1px] border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-gray-900">Equipment Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">Type: </span>
            <span className="text-sm font-medium text-gray-800">
              {equipmentType || "Tractor"}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Power: </span>
            <span className="text-sm font-medium text-gray-800">{power || "50 HP"}</span>
          </div>
          <div>
            <span className="text-sm text-gray-500">Usage Hours: </span>
            <span className="text-sm font-medium text-gray-800">
              {usageHours || "1200 Hrs"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
