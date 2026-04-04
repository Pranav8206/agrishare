import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Icon from "@/Components/AddPage/Icon";
import { icons } from "@/Components/AddPage/icons";

export default function ImageUploader({
  images,
  setImages,
  onRetryUpload,
  disabled = false,
  maxImages,
  maxOriginalFileSizeBytes,
  maxOriginalFileSizeMb,
}) {
  const { t } = useTranslation();
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files) => {
    const selectedFiles = Array.from(files || []).filter((file) =>
      file.type?.startsWith("image/"),
    );
    if (!selectedFiles.length) return;

    const oversizeFiles = selectedFiles.filter(
      (file) => file.size > maxOriginalFileSizeBytes,
    );
    const sizeAllowedFiles = selectedFiles.filter(
      (file) => file.size <= maxOriginalFileSizeBytes,
    );

    if (oversizeFiles.length > 0) {
      toast.error(
        t("add.maxOriginalFileSize", {
          maxMb: maxOriginalFileSizeMb,
        }),
      );
    }

    if (!sizeAllowedFiles.length) return;

    const remainingSlots = Math.max(0, maxImages - images.length);
    if (remainingSlots === 0) {
      toast.error(t("add.maxImagesReached"));
      return;
    }

    const acceptedFiles = sizeAllowedFiles.slice(0, remainingSlots);
    const skippedCount = sizeAllowedFiles.length - acceptedFiles.length;

    if (skippedCount > 0) {
      toast.error(t("add.maxImagesSelected", { max: maxImages }));
    }

    const newImgs = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      status: "uploading",
      uploadedUrl: "",
      error: "",
    }));

    setImages((prev) => [...prev, ...newImgs]);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => {
          if (!disabled) inputRef.current.click();
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${
            disabled
              ? "border-gray-200 bg-gray-100 cursor-not-allowed"
              : dragging
                ? "border-primary-accent bg-primary-accent-light/40 scale-[1.01]"
                : "border-gray-200 hover:border-primary-accent hover:bg-primary-accent-light/35"
          }`}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
            ${dragging ? "bg-primary-accent-light" : "bg-gray-100"}`}
          >
            <Icon
              path={icons.upload}
              className={`w-5 h-5 ${dragging ? "text-primary-accent" : "text-gray-400"}`}
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-700">
              {dragging ? t("add.dropImagesHere") : t("add.dragDropImages")}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("add.or")}{" "}
              <span className="text-primary-accent font-semibold">
                {t("add.browseToUpload")}
              </span>{" "}
              · {t("add.imageLimit")}
            </p>
          </div>
          <span className="text-xs text-gray-300">
            {images.length}/{maxImages} {t("add.images")}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100"
            >
              <img
                src={img.url}
                alt={img.name}
                className="w-full h-full object-cover"
              />
              {img.status === "uploaded" && i === 0 && (
                <span className="absolute bottom-1 left-1 bg-primary-accent text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                  {t("add.cover")}
                </span>
              )}
              <div className="absolute top-1 left-1">
                {img.status === "uploading" && (
                  <span className="inline-flex items-center gap-1 bg-black/65 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                    <span className="h-2.5 w-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                    {t("add.uploading")}
                  </span>
                )}
                {img.status === "uploaded" && (
                  <span className="inline-flex items-center gap-1 bg-emerald-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                    <Icon path={icons.check} className="w-2.5 h-2.5" />
                    {t("add.uploaded")}
                  </span>
                )}
                {img.status === "failed" && (
                  <span className="inline-flex items-center gap-1 bg-red-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                    <Icon path={icons.x} className="w-2.5 h-2.5" />
                    {t("add.failed")}
                  </span>
                )}
              </div>
              {img.status === "failed" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRetryUpload?.(img.id);
                  }}
                  className="absolute bottom-1 right-1 bg-white/95 border border-gray-200 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                >
                  {t("add.retry")}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full
                           opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <Icon path={icons.x} className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
