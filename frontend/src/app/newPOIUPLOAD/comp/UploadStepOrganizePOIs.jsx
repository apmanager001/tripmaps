// UploadStepOrganizePOIs.jsx
"use client";
import { useState, useEffect } from "react";
import {
  Trash2,
  MapPin,
  Locate,
  LocateOff,
  X,
  Calendar,
  Info,
  Star,
} from "lucide-react";
import { toast } from "react-hot-toast";
import Map from "./map";
import AddTags from "../../dashboard/comp/comps/addTags";
import ManualMap from "./manualMap";
import ModalPortal from "@/components/modalPortal";

const MAX_POIS = 25;
const MAX_PHOTOS_PER_POI = 3;

export default function UploadStepOrganizePOIs({
  allPhotos,
  poiArray,
  setPoiArray,
  onBack,
  onNext,
  setAllPhotos,
}) {
  // Each POI: { name, description, tags, photos: [File], coordinates: {lat, lng} }
  const [selectedPhotos, setSelectedPhotos] = useState([]); // For new POI
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: null, lng: null });
  const [poiName, setPoiName] = useState("");
  const [poiDescription, setPoiDescription] = useState("");
  const [poiTags, setPoiTags] = useState([]);
  const [poiDate, setPoiDate] = useState("");

  // When selectedPhotos changes, default the date to the first selected photo's dateVisited
  // Check up to the first 3 selected photos (indices 0,1,2) and use the first valid dateVisited
  useEffect(() => {
    if (!selectedPhotos || selectedPhotos.length === 0) {
      setPoiDate("");
      return;
    }

    let found = false;
    const limit = Math.min(3, selectedPhotos.length);
    for (let i = 0; i < limit; i++) {
      const dv = selectedPhotos[i]?.dateVisited;
      if (dv) {
        try {
          // format as YYYY-MM-DD for input[type=date]
          const iso = new Date(dv).toISOString().split("T")[0];
          setPoiDate(iso);
          found = true;
          break;
        } catch (e) {
          // if parsing fails continue to next
        }
      }
    }

    if (!found) {
      setPoiDate("");
    }
  }, [selectedPhotos]);

  // Default primary photo to first selected photo when selection changes
  useEffect(() => {
    if (selectedPhotos && selectedPhotos.length > 0) {
      // If no primary selected, default to first (index 0)
      setSelectedPrimaryIdx((prev) => (prev == null ? 0 : prev));
    } else {
      setSelectedPrimaryIdx(null);
    }
  }, [selectedPhotos]);

  const [selectedCoordIdx, setSelectedCoordIdx] = useState(null); // index of photo to use for coordinates
  const [selectedPrimaryIdx, setSelectedPrimaryIdx] = useState(null); // index of primary photo
  const [showMapModal, setShowMapModal] = useState(false);
  const [manualCoords, setManualCoords] = useState({ lat: null, lng: null }); // {lat, lng}
  const [poiCoords, setPoiCoords] = useState(null); // {lat, lng}

  // // Helper: extract coordinates from File (simulate EXIF for demo)
  // const getPhotoCoords = (file) => {
  //   // In real app, extract EXIF GPS here. For demo, use file.mockCoords if present.
  //   return file.mockCoords || null;
  // };
  const handleAddPOI = () => {
    if (poiArray.length >= MAX_POIS) {
      toast.error(`You can only have up to ${MAX_POIS} POIs per map.`);
      return;
    }
    if (selectedPhotos.length === 0) {
      toast.error("Select at least one photo for this POI.");
      return;
    }
    if (selectedPhotos.length > MAX_PHOTOS_PER_POI) {
      toast.error(`A POI can have up to ${MAX_PHOTOS_PER_POI} photos.`);
      return;
    }
    if (selectedPrimaryIdx == null && selectedPhotos.length > 0 || selectedPrimaryIdx < 0 || selectedPrimaryIdx >= selectedPhotos.length) {
      toast.error("Please select a primary photo for this POI.");
      return;
    }
      if (!poiName.trim()) {
        toast.error("Location Name is required.");
        return;
      }
    // Coordinates: from selected photo or manual
    let coordinates = poiCoords;

    if (!coordinates) {
      toast.error("Please select coordinates for this POI.");
      return;
    }
    setPoiArray((prev) => [
      ...prev,
      {
        name: poiName.trim(),
        description: poiDescription,
        dateVisited: poiDate
          ? new Date(poiDate).toISOString()
          : new Date().toISOString(),
        tags: poiTags,
        photos: selectedPhotos,
        primaryPhoto: selectedPrimaryIdx != null ? selectedPhotos[selectedPrimaryIdx] : null,
        primaryPhoto:
          selectedPrimaryIdx != null
            ? selectedPhotos[selectedPrimaryIdx]
            : null,
        coordinates,
      },
    ]);
    setSelectedPhotos([]);
    setPoiName("");
    setPoiDescription("");
    setPoiTags([]);
    setSelectedCoordIdx(null);
    setSelectedPrimaryIdx(null);
    setManualCoords({ lat: null, lng: null });
    setPoiDate("");
  };

  const handlePhotoSelect = (file) => {
    setSelectedPhotos((prev) =>
      prev.includes(file)
        ? prev.filter((f) => f !== file)
        : prev.length < MAX_PHOTOS_PER_POI
        ? [...prev, file]
        : prev
    );
    // If removing a photo that was selected for coordinates, reset coord selection
    if (
      selectedCoordIdx !== null &&
      selectedPhotos[selectedCoordIdx] === file
    ) {
      setSelectedCoordIdx(null);
    }
  };

  const handleRemovePOI = (idx) => {
    setPoiArray((prev) => prev.filter((_, i) => i !== idx));
  };

  // Photos not yet assigned to a POI
  const assignedPhotos = poiArray.flatMap((poi) => poi.photos);
  const unassignedPhotos = allPhotos.filter((f) => !assignedPhotos.includes(f));

  const handleRemovePhoto = (file) => {
    setAllPhotos((prev) => prev.filter((f) => f !== file));
    setSelectedPhotos((prev) => prev.filter((f) => f !== file));
    // If removing a photo that was selected for coordinates, reset coord selection
    if (
      selectedCoordIdx !== null &&
      selectedPhotos[selectedCoordIdx] === file
    ) {
      setSelectedCoordIdx(null);
    }
    // If removing a photo that was primary, reset primary selection
    if (
      selectedPrimaryIdx !== null &&
      selectedPhotos[selectedPrimaryIdx] === file
    ) {
      setSelectedPrimaryIdx(null);
    }
  };

  // For demo: set manual coordinates
  const handleSetManualCoords = (lat, lng) => {
    setManualCoords({ lat: lat, lng: lng });
    setPoiCoords({ lat: lat, lng: lng });
    setSelectedCoordIdx("manual");
  };

  const handleMapExpandChange = (isExpanded) => {
    setIsExpanded(isExpanded);
  };
  return (
    <div className="w-full md:max-w-xl md:mx-auto px-4 md:px-2 m-0">
      <h3 className="font-semibold mb-2">
        Unassigned Photos ({unassignedPhotos.length})
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {unassignedPhotos.map((file, idx) => (
          <div
            key={idx}
            className={`relative border rounded-lg cursor-pointer ${
              selectedPhotos.includes(file)
                ? "border-primary"
                : "border-base-300"
            }`}
            onClick={() => handlePhotoSelect(file)}
          >
            <img
              src={file.previewUrl}
              alt=""
              className="w-full h-20 object-cover rounded-lg"
            />
            {selectedPhotos.includes(file) && (
              <span className="absolute top-1 left-1 bg-primary text-white text-xs px-1 rounded">
                Selected
              </span>
            )}
            <button
              type="button"
              className="absolute top-1 right-1 bg-base-100/80 rounded-full p-1 text-error hover:bg-error hover:text-white transition-opacity opacity-80 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleRemovePhoto(file);
              }}
              aria-label="Remove photo"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              className={`absolute bottom-1 right-1 bg-base-100/80 rounded-full p-1 transition-opacity opacity-80 tooltip tooltip-top z-30`}
              aria-label="Location on photo"
              data-tip={file.lat && file.lng ? "Has GPS info" : "No GPS info"}
              disabled={!(file.lat && file.lng)}
            >
              {file.lat && file.lng ? (
                <Locate size={16} className="text-info" />
              ) : (
                <LocateOff size={16} className="text-neutral-500" />
              )}
            </button>
            <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded flex items-center gap-1">
              {/* <Calendar size={10} /> */}
              {new Date(file.dateVisited).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* POI Info Form: Only show if at least one photo selected */}
      {selectedPhotos.length > 0 && (
        <div className="border border-neutral rounded-lg p-4 mb-4 bg-base-300">
          <h4 className="font-semibold mb-2">Set Point of Interest</h4>
          <div className="mb-2 w-full">
            <div className="indicator">
              <span
                className="indicator-item indicator-top indicator-end pl-5 tooltip tooltip-top"
                data-tip="Star will mark the primary photo, Choose the photo to set coordinates, or set manually"
              >
                <Info className="w-4 h-4 text-base-content/60" />
              </span>
              <span className="text-sm font-medium text-base-content/70">
                Photos & Coordinates
              </span>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-3 gap-2 mb-4">
                {selectedPhotos.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative flex flex-col items-center bg-base-100 rounded-xl shadow-md border border-base-300 hover:shadow-lg transition-all duration-200  group"
                  >
                    <div className="relative w-full aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={file.previewUrl}
                        alt="POI photo"
                        className="w-full h-full object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      {/* Date overlay bottom right */}
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
                        <Calendar size={10} />
                        {new Date(file.dateVisited).toLocaleDateString()}
                      </div>
                      {/* Map button top left */}
                      <button
                        type="button"
                        className="absolute top-2 left-2 btn btn-xs btn-accent rounded-lg shadow"
                        onClick={() => {
                          document.getElementById("viewMap").showModal();
                          setMapCoords({ lat: file.lat, lng: file.lng });
                        }}
                        aria-label="View on map"
                      >
                        Map
                      </button>
                      <button
                        type="button"
                        title={
                          selectedPrimaryIdx === idx
                            ? "Primary photo"
                            : "Set as primary"
                        }
                        className={`btn btn-circle  btn-sm absolute top-2 right-2 `}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPrimaryIdx((prev) =>
                            prev === idx ? null : idx
                          );
                          // if marking this photo as primary and it has coords, also set coords if none set
                          if (
                            (selectedCoordIdx == null ||
                              selectedCoordIdx === "manual") &&
                            file.lat &&
                            file.lng
                          ) {
                            setSelectedCoordIdx(idx);
                            setPoiCoords({ lat: file.lat, lng: file.lng });
                          }
                        }}
                      >
                        {/* simple star using unicode to avoid extra icons dependency */}
                        {/* Use Lucide Star; when selected, fill it via fill="currentColor" and apply a yellow text color */}
                        <Star
                          className={
                            selectedPrimaryIdx === idx
                              ? "text-yellow-400"
                              : "text-neutral-400"
                          }
                          fill={
                            selectedPrimaryIdx === idx ? "currentColor" : "none"
                          }
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2 w-full px-3">
                      <div className="flex items-center gap-2">
                        {file.lat && file.lng && (
                          <label className="flex items-center gap-2">
                            <input
                              id={`poi-coords-${idx}`}
                              type="radio"
                              name="poi-coords"
                              className="radio radio-primary"
                              checked={selectedCoordIdx === idx}
                              onChange={() => {
                                setSelectedCoordIdx(idx);
                                setManualCoords({ lat: null, lng: null });
                                setPoiCoords({ lat: file.lat, lng: file.lng });
                              }}
                            />
                            <span className="text-xs text-neutral-600">
                              {file.lat.toFixed(3)}, {file.lng.toFixed(3)}
                            </span>
                          </label>
                        )}
                      </div>
                      {/* <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title={
                            selectedPrimaryIdx === idx
                              ? "Primary photo"
                              : "Set as primary"
                          }
                          className={`btn btn-ghost btn-sm p-1 absolute top-2 right-2 ${
                            selectedPrimaryIdx === idx
                              ? "text-yellow-400"
                              : "text-neutral-400"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrimaryIdx((prev) =>
                              prev === idx ? null : idx
                            );
                            // if marking this photo as primary and it has coords, also set coords if none set
                            if (
                              (selectedCoordIdx == null ||
                                selectedCoordIdx === "manual") &&
                              file.lat &&
                              file.lng
                            ) {
                              setSelectedCoordIdx(idx);
                              setPoiCoords({ lat: file.lat, lng: file.lng });
                            }
                          }}
                        >
                          {selectedPrimaryIdx === idx ? "★" : "☆"}
                        </button>
                      </div> */}
                    </div>
                  </div>
                ))}
              </div>
              <label
                htmlFor="manual-coords-input"
                className="flex items-center gap-2 cursor-pointer mt-2"
              >
                <input
                  id="manual-coords-input"
                  type="radio"
                  name="poi-coords"
                  checked={selectedCoordIdx === "manual"}
                  onChange={() => {
                    setSelectedCoordIdx("manual");
                    setManualCoords(manualCoords);
                    setPoiCoords(manualCoords);
                  }}
                />
                <span className="text-xs flex items-center gap-1">
                  <MapPin size={14} />
                  {manualCoords.lat && manualCoords.lng ? (
                    <span>
                      Manual:{" "}
                      <span
                        className="badge badge-xs badge-primary text-xs"
                        onClick={() => {
                          // setPickMap(true);
                          // setShowMapModal(true);
                        }}
                      >
                        {manualCoords.lat?.toFixed(3)},{" "}
                        {manualCoords.lng?.toFixed(3)}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="link link-primary p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("manualMap").showModal();
                        // setPickMap(false);
                        // setShowMapModal(true);
                      }}
                    >
                      Pick on map
                    </button>
                  )}
                </span>
              </label>
            </div>
          </div>
          <div className="mb-2">
            <label
              htmlFor="location-name"
              className="block text-sm font-medium mb-1 text-base-content/70"
            >
              Location Name <span className="text-error">*</span>
            </label>
            <input
              id="location-name"
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter location name"
              value={poiName}
              onChange={(e) => setPoiName(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="location-description"
              className="block text-sm font-medium mb-1 text-base-content/70"
            >
              Description (optional)
            </label>
            <textarea
              id="location-description"
              className="textarea textarea-bordered w-full"
              placeholder="Description (optional)"
              value={poiDescription}
              onChange={(e) => setPoiDescription(e.target.value)}
              rows={2}
              autoComplete="off"
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="poi-date"
              className="block text-sm font-medium mb-1 text-base-content/70"
            >
              Date Visited
            </label>
            <input
              id="poi-date"
              type="date"
              className="input input-bordered w-full"
              placeholder="Date Visited"
              value={poiDate}
              onChange={(e) => setPoiDate(e.target.value)}
            />
          </div>
          <div className="flex justify-between items-top  mb-2">
            {/* <div className="mb-2 w-3/5">
              <div className="block text-sm font-medium mb-1">
                Coordinates <span className="text-error">*</span>
              </div>
              <div className="flex flex-wrap gap-3 mb-2">
                {selectedPhotos
                  .filter((f) => f.lat && f.lng)
                  .map((file, idx) => {
                    return (
                      <div
                        key={idx}
                        className="relative border border-neutral rounded-lg p-2 flex flex-col items-center bg-base-100"
                      >
                        <img
                          src={file.previewUrl}
                          alt="POI photo"
                          className="min- w-16 h-16 object-cover rounded mb-1"
                        />

                        <button
                          type="button"
                          className="btn btn-xs btn-accent rounded-lg mb-1"
                          onClick={() => {
                            // setPickMap(true);
                            // setShowMapModal(true);
                            document.getElementById("viewMap").showModal();
                            setMapCoords({ lat: file.lat, lng: file.lng });
                          }}
                        >
                          View Map
                        </button>
                        <div className="flex items-center gap-2 mt-4">
                          <input
                            id={`poi-coords-${idx}`}
                            type="radio"
                            name="poi-coords"
                            className="cursor-pointer"
                            checked={selectedCoordIdx === idx}
                            onChange={() => {
                              setSelectedCoordIdx(idx);
                              setManualCoords({ lat: null, lng: null });
                              setPoiCoords({ lat: file.lat, lng: file.lng });
                            }}
                          />
                          <span className="text-xs font-bold badge badge-primary">
                            {file.lat.toFixed(3)}, {file.lng.toFixed(3)}
                          </span> 
                        </div>
                      </div>
                    );
                  })}
              </div>
              <label
                htmlFor="manual-coords-input"
                className="flex items-center gap-2 cursor-pointer mt-2"
              >
                <input
                  id="manual-coords-input"
                  type="radio"
                  name="poi-coords"
                  checked={selectedCoordIdx === "manual"}
                  onChange={() => {
                    setSelectedCoordIdx("manual");
                    setManualCoords(manualCoords);
                    setPoiCoords(manualCoords);
                  }}
                />
                <span className="text-xs flex items-center gap-1">
                  <MapPin size={14} />
                  {manualCoords.lat && manualCoords.lng ? (
                    <span>
                      Manual:{" "}
                      <span
                        className="badge badge-xs badge-primary text-xs"
                        onClick={() => {
                          // setPickMap(true);
                          // setShowMapModal(true);
                        }}
                      >
                        {manualCoords.lat?.toFixed(3)},{" "}
                        {manualCoords.lng?.toFixed(3)}
                      </span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="link link-primary p-0"
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById("manualMap").showModal();
                        // setPickMap(false);
                        // setShowMapModal(true);
                      }}
                    >
                      Pick on map
                    </button>
                  )}
                </span>
              </label>
            </div> 
            */}
            <div className="mb-2 w-full min-h-40">
              <label
                htmlFor="add-tags-input"
                className="block text-sm font-medium mb-1 text-base-content/70"
              >
                Tags
              </label>
              <AddTags
                existingTags={poiTags}
                onTagAdd={(tag) => setPoiTags((tags) => [...tags, tag])}
                onTagRemove={(tag) =>
                  setPoiTags((tags) => tags.filter((t) => t !== tag))
                }
                placeholder="Search Tags"
              />
            </div>
            <div className="w-1/2"></div>
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddPOI}
            disabled={
              selectedPhotos.length === 0 ||
              !poiName.trim() ||
              poiCoords?.lat == null ||
              poiCoords?.lng == null
            }
          >
            Add POI
          </button>
        </div>
      )}

      <h4 className="font-semibold mb-2">POIs ({poiArray.length})</h4>
      <div className="space-y-2 mb-6">
        {poiArray.map((poi, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 border border-neutral bg-base-300 p-2 rounded-lg"
          >
            <span className="font-medium">{poi.name}</span>
            <span className="text-xs text-neutral-500">
              ({poi.photos.length} photo{poi.photos.length > 1 ? "s" : ""})
            </span>
            <button
              className="btn btn-xs btn-circle btn-error ml-auto"
              onClick={() => handleRemovePOI(idx)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        <button className="btn btn-ghost" onClick={onBack}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={onNext}
          disabled={poiArray.length === 0 || unassignedPhotos.length > 0}
        >
          Next: Map Summary
        </button>
      </div>
      <ModalPortal>
        <dialog id="viewMap" className="modal w-full h-full">
          <div
            className={`relative bg-base-200 rounded-lg shadow-lg border border-neutral p-4 ${
              isExpanded ? "w-full h-full" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Location on Map</h4>
              <form method="dialog">
                <button className="btn btn-circle btn-ghost">
                  <X />
                </button>
              </form>
            </div>
            <Map
              coordArray={[mapCoords]}
              onExpandChange={handleMapExpandChange}
            />
          </div>
        </dialog>
      </ModalPortal>
      <ModalPortal>
        <dialog id="manualMap" className="modal w-full h-full">
          <div
            className={`relative bg-base-200 rounded-lg shadow-lg border border-neutral p-4 ${
              isExpanded ? "w-full h-full" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">Pick Location on Map</h4>
              <form method="dialog">
                <button className="btn btn-circle btn-ghost">
                  <X />
                </button>
              </form>
            </div>
            <ManualMap
              onSetCoords={handleSetManualCoords}
              onExpandChange={handleMapExpandChange}
            />
          </div>
        </dialog>
      </ModalPortal>
    </div>
  );
}
