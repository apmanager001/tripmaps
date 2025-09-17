import React, { useState, useRef, useCallback } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const ImageCropper = ({
  imageSrc,
  onCropComplete,
  onCancel,
  onConfirm,
  aspectRatio = 4 / 3,
  maxWidth = 800,
  maxHeight = 600,
}) => {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 100, // Full width
    height: 75, // 4:3 ratio (100 * 3/4)
    x: 0,
    y: 12.5, // Center vertically
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [rotation, setRotation] = useState(0);
  const imgRef = useRef(null);

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget;
    setImageDimensions({ width, height });
    setImageLoaded(true);

    // Set initial crop to full width with 4:3 ratio
    setCrop({
      unit: "%",
      width: 100, // Full width
      height: 75, // 4:3 ratio (100 * 3/4)
      x: 0,
      y: 12.5, // Center vertically
    });
  }, []);

  const handleCropComplete = useCallback((crop, pixelCrop) => {
    setCrop(crop);
    // Don't auto-submit, just update the crop state
  }, []);

  const handleConfirm = () => {
    if (onConfirm && crop.width > 0 && crop.height > 0) {
      onConfirm({ ...crop, rotation });
    }
  };

  const handleReset = () => {
    if (imageLoaded) {
      setCrop({
        unit: "%",
        width: 100, // Full width
        height: 75, // 4:3 ratio (100 * 3/4)
        x: 0,
        y: 12.5, // Center vertically
      });
      setRotation(0);
    }
  };

  return (
    <div
      className="w-full h-fullfixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Crop Image (4:3 Ratio)</h3>
          <div className="flex gap-2">
            {/* Rotation Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation((prev) => prev - 90)}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Rotate Left"
              >
                ↶
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {rotation}°
              </span>
              <button
                onClick={() => setRotation((prev) => prev + 90)}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                title="Rotate Right"
              >
                ↷
              </button>
            </div>

            <button
              onClick={handleReset}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Reset
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!crop.width || !crop.height}
              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Crop
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="p-4 flex justify-center bg-gray-100">
          <div className="relative max-w-full max-h-[70vh] overflow-auto">
            <ReactCrop
              crop={crop}
              onChange={setCrop}
              onComplete={handleCropComplete}
              aspect={aspectRatio}
              minWidth={20}
              minHeight={15}
              keepSelection
              ruleOfThirds
              className="max-w-full max-h-full"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                onLoad={onImageLoad}
                alt="Crop preview"
                className="max-w-full max-h-full object-contain"
                style={{
                  maxWidth: `${maxWidth}px`,
                  maxHeight: `${maxHeight}px`,
                  transform: `rotate(${rotation}deg)`,
                  transition: "transform 0.3s ease",
                }}
              />
            </ReactCrop>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Instructions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Drag the corners or edges to adjust the crop area</li>
              <li>
                The crop area maintains a 4:3 aspect ratio and spans full width
              </li>
              <li>Use the rotation buttons (↶ ↷) to rotate the image</li>
              <li>
                Areas outside the crop zone will be darkened in the final image
              </li>
              <li>
                Use the Reset button to return to the default crop and rotation
              </li>
              <li>
                Click "Confirm Crop" when you're satisfied with the result
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
