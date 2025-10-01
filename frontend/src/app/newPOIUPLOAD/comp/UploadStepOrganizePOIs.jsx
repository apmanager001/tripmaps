// UploadStepOrganizePOIs.jsx
"use client";
import { useState } from "react";
import { Trash2, MapPin, Locate, LocateOff, X } from "lucide-react";
import { toast } from "react-hot-toast";
import Map from "./map";
import AddTags from "../../dashboard/comp/comps/addTags";
import ManualMap from "./manualMap";

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
  const [mapCoords, setMapCoords] = useState({ lat: null, lng: null });
  const [poiName, setPoiName] = useState("");
  const [pickMap, setPickMap] = useState(true);
  const [poiDescription, setPoiDescription] = useState("");
  const [poiTags, setPoiTags] = useState([]);
  const [selectedCoordIdx, setSelectedCoordIdx] = useState(null); // index of photo to use for coordinates
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
        tags: poiTags,
        photos: selectedPhotos,
        coordinates,
      },
    ]);
    setSelectedPhotos([]);
    setPoiName("");
    setPoiDescription("");
    setPoiTags([]);
    setSelectedCoordIdx(null);
    setManualCoords({ lat: null, lng: null });
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
  };

  // Modal map (placeholder, not implemented)
  const handleOpenMapModal = () => setShowMapModal(true);
  const handleCloseMapModal = () => setShowMapModal(false);
  // For demo: set manual coordinates
  const handleSetManualCoords = (lat, lng) => {
    setManualCoords({ lat: lat, lng: lng });
    setShowMapModal(false);
    setPoiCoords({ lat: lat, lng: lng });
    setSelectedCoordIdx("manual");
  };
  console.log(poiCoords);
  return (
    <div className="w-full max-w-xl mx-auto px-4 md:px-2">
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
              className={`absolute bottom-1 right-1 bg-base-100/80 rounded-full p-1 transition-opacity opacity-80 tooltip tooltip-left`}
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
          </div>
        ))}
      </div>

      {/* POI Info Form: Only show if at least one photo selected */}
      {selectedPhotos.length > 0 && (
        <div className="border border-neutral rounded-lg p-4 mb-4 bg-base-300">
          <h4 className="font-semibold mb-2">POI Info</h4>
          <div className="mb-2">
            <label
              htmlFor="location-name"
              className="block text-sm font-medium mb-1"
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
              className="block text-sm font-medium mb-1"
            >
              Description <span className="text-neutral-400">(optional)</span>
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
          <div className="flex justify-between items-top  mb-2">
            <div className="mb-2 w-3/5">
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
                            setPickMap(true);
                            setShowMapModal(true);
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
                          {/* <span className="text-xs font-bold badge badge-primary">
                            {file.lat.toFixed(3)}, {file.lng.toFixed(3)}
                          </span> */}
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
                          setPickMap(true);
                          setShowMapModal(true);
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
                        setPickMap(false);
                        setShowMapModal(true);
                      }}
                    >
                      Pick on map
                    </button>
                  )}
                </span>
              </label>
            </div>
            <div className="mb-2 w-2/5">
              <label
                htmlFor="add-tags-input"
                className="block text-sm font-medium mb-1"
              >
                Tags
              </label>
              <AddTags
                existingTags={poiTags}
                onTagAdd={(tag) => setPoiTags((tags) => [...tags, tag])}
                onTagRemove={(tag) =>
                  setPoiTags((tags) => tags.filter((t) => t !== tag))
                }
                placeholder="Type to search or add tags..."
              />
            </div>
          </div>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddPOI}
            disabled={
              selectedPhotos.length === 0 ||
              !poiName.trim() ||
              poiCoords?.lat === null ||
              poiCoords?.lng === null
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

      {/* Map Modal (placeholder) */}
      {showMapModal && (
        <div className="fixed z-50 flex items-center justify-center min-h-screen bg-black/40 min-w-full">
          <div className="bg-base-200 rounded-lg shadow-lg p-6 w-full max-w-md relative border border-neutral">
            <button
              className="absolute top-2 right-2 btn btn-sm btn-circle"
              onClick={handleCloseMapModal}
            >
              <X />
            </button>
            <h4 className="font-semibold mb-2">Pick Location on Map</h4>
            {pickMap ? (
              <Map coordArray={[mapCoords]} />
            ) : (
              <ManualMap onSetCoords={handleSetManualCoords} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
