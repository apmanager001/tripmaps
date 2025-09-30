// UploadStepPhotos.jsx
"use client";
import { useRef, useState } from "react";
import { Upload, Trash2, Locate, LocateOff } from "lucide-react";
import { toast } from "react-hot-toast";
import EXIF from "exif-js";

const MAX_POIS = 25;
const MAX_PHOTOS_PER_POI = 3;

export default function UploadStepPhotos({ allPhotos, setAllPhotos, onNext }) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [poiArray, setPoiArray] = useState([]);

  // Helper: convert EXIF GPS to decimal
  function toDecimal(gps, ref) {
    if (!gps) return null;
    const [d, m, s] = gps;
    let dec = d + m / 60 + s / 3600;
    if (ref === "S" || ref === "W") dec = -dec;
    return dec;
  }
  if (typeof window !== "undefined" && !window.EXIF) {
    window.EXIF = EXIF;
  }
  // Extract EXIF GPS and attach lat/lng directly to file
  const extractExifAndAttach = (file, cb) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const image = new window.Image();
      image.src = e.target.result;
      image.onload = function () {
        if (typeof window.EXIF !== "undefined" && window.EXIF.getData) {
          window.EXIF.getData(image, function () {
            const exif = window.EXIF.getAllTags(this);
            let lat = null,
              lng = null;
            if (exif.GPSLatitude && exif.GPSLongitude) {
              lat = toDecimal(exif.GPSLatitude, exif.GPSLatitudeRef);
              lng = toDecimal(exif.GPSLongitude, exif.GPSLongitudeRef);
            }
            if (lat && lng) {
              file.lat = lat;
              file.lng = lng;
            }
            cb(file);
          });
        } else {
          cb(file);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );
    if (validFiles.length + allPhotos.length > MAX_POIS * MAX_PHOTOS_PER_POI) {
      toast.error(
        `You can upload up to ${MAX_POIS * MAX_PHOTOS_PER_POI} photos in total.`
      );
      return;
    }
    // For each file, extract EXIF and add to allPhotos
    let processed = 0;
    const newFiles = [];
    validFiles.forEach((file) => {
      extractExifAndAttach(file, (f) => {
        newFiles.push(f);
        processed++;
        if (processed === validFiles.length) {
          setAllPhotos((prev) => [...prev, ...newFiles]);
        }
      });
    });
  };

  const handleFileInput = (e) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemovePhoto = (idx) => {
    setAllPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-base-300 hover:border-primary/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="space-y-4">
          <div className="p-4 bg-base-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
            <Upload size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium text-primary mb-2">
              {isDragOver ? "Drop photos here" : "Drag and drop photos here"}
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              or click to browse files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
            >
              <Upload size={16} /> Choose Photos
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Max {MAX_POIS * MAX_PHOTOS_PER_POI} photos. Each POI can have up to{" "}
            {MAX_PHOTOS_PER_POI} photos.
          </p>
        </div>
      </div>
      {allPhotos.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold mb-2">
            Uploaded Photos ({allPhotos.length})
          </h4>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {allPhotos.map((file, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-1 right-1 bg-base-100/80 rounded-full p-1 text-error hover:bg-error hover:text-white transition-opacity opacity-80 group-hover:opacity-100 cursor-pointer"
                  onClick={() => handleRemovePhoto(idx)}
                  aria-label="Remove photo"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  type="button"
                  className={`absolute bottom-1 right-1 bg-base-100/80 rounded-full p-1 transition-opacity opacity-80 group-hover:opacity-100 tooltip tooltip-left`}
                  aria-label="Location on photo"
                  data-tip={
                    file.lat && file.lng ? "Has GPS info" : "No GPS info"
                  }
                  disabled={!(file.lat && file.lng)}
                >
                  {file.lat && file.lng ? (
                    <Locate size={16} className="text-info" />
                  ) : (
                    <LocateOff size={16} className="text-neutral-500" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end mt-6">
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={allPhotos.length === 0}
        >
          Next: Organize POIs
        </button>
      </div>
    </div>
  );
}
