// UploadWizard.jsx
"use client";
import { useState } from "react";

import ProgressBar from "./progressBar";
import UploadStepPhotos from "./UploadStepPhotos";
import UploadStepOrganizePOIs from "./UploadStepOrganizePOIs";
// import UploadStepPOIInfo from "./UploadStepPOIInfo";
import UploadStepMapSummary from "./UploadStepMapSummary";

const UploadWizard = () => {
  const [step, setStep] = useState(1); // 1: Upload, 2: Organize, 3: Edit, 4: Summary
  const [allPhotos, setAllPhotos] = useState([]); // All uploaded photos
  const [poiArray, setPoiArray] = useState([]); // [{ name, description, tags, photos: [] }]
  const [mapName, setMapName] = useState("");

  const handleSubmit = async () => {
    // TODO: Implement actual save logic (API call)
    setStep(1);
    setAllPhotos([]);
    setPoiArray([]);
    setMapName("");
  };
  return (
    <div className="flex flex-col items-center my-4">
      <ProgressBar step={step} total={3} />
      {/* Tutorial button using DaisyUI modal toggle */}
      <div className="flex justify-end items-end mb-2 w-full mr-2">
        <label
          htmlFor="tutorial-modal"
          className="btn btn-ghost btn-sm"
          role="button"
          aria-label="Watch upload tutorial"
        >
          Watch tutorial
        </label>
      </div>

      {/* DaisyUI modal toggle (no local state) */}
      <input type="checkbox" id="tutorial-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box max-w-3xl">
          <div className="flex justify-end">
            <label
              htmlFor="tutorial-modal"
              className="btn btn-ghost btn-sm"
              aria-label="Close tutorial"
            >
              Close
            </label>
          </div>
          <div className="mt-2">
            <video
              src="/tutorial.mp4"
              controls
              className="w-full h-auto max-h-[700px] rounded"
            />
          </div>
          <div className="modal-action">
            <label htmlFor="tutorial-modal" className="btn">
              Done
            </label>
          </div>
        </div>
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
      {/* {step === 3 && (
        <UploadStepPOIInfo
          poiArray={poiArray}
          setPoiArray={setPoiArray}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )} */}
      {step === 3 && (
        <UploadStepMapSummary
          poiArray={poiArray}
          mapName={mapName}
          setMapName={setMapName}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};
export default UploadWizard;
