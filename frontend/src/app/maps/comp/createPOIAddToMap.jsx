import React, {useState, useEffect} from 'react'
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import UploadStepPhotos from '@/app/newPOIUPLOAD/comp/UploadStepPhotos';
import UploadStepOrganizePOIs from '@/app/newPOIUPLOAD/comp/UploadStepOrganizePOIs';
import SubmitComponentPoiToMap from './submitComponentPoiToMap';
// import { poiApi } from "@/lib/api"; // Uncomment when API integration is ready

const CreatePOIAddToMap = ({ isOpen, onClose, mapId, mapName }) => {
  const queryClient = useQueryClient();
  const [addedPOIs, setAddedPOIs] = useState(new Set());
  const [step, setStep] = useState(1); // 1: Upload, 2: Organize, 3: Edit, 4: Summary
  const [allPhotos, setAllPhotos] = useState([]); // All uploaded photos
  const [poiArray, setPoiArray] = useState([]); // [{ name, description, tags, photos: [] }]

  const handleSubmit = async () => {
    // TODO: Implement actual save logic (API call)
    setStep(1);
    setAllPhotos([]);
    setPoiArray([]);
  };

  useEffect(() => {
    if (!isOpen) {
      setAddedPOIs(new Set());
    } else {
      // Invalidate POI queries when modal opens to ensure fresh data
      queryClient.invalidateQueries(["userPOIs"]);
    }
  }, [isOpen, queryClient]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-primary">Add POI to Map</h3>
            <p className="text-sm text-neutral-600">
              Add public POIs to "{mapName}"
            </p>
          </div>
          <button
            id="close-modal-button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X size={20} />
          </button>
        </div>
        {step === 1 && (
          <UploadStepPhotos
            allPhotos={allPhotos}
            setAllPhotos={setAllPhotos}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <UploadStepOrganizePOIs
            allPhotos={allPhotos}
            setAllPhotos={setAllPhotos}
            poiArray={poiArray}
            setPoiArray={setPoiArray}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
            <SubmitComponentPoiToMap 
                poiArray={poiArray}
                onBack={() => setStep(2)}
                onSubmit={handleSubmit}
                mapId={mapId}
            />
        )}
      </div>
    </div>
  );
};

export default CreatePOIAddToMap