"use client";
import React from "react";
import { Instagram, Camera } from "lucide-react";
import toast from "react-hot-toast";

const InstagramShare = ({ mapName, mapId, pois = [] }) => {
  const shareToInstagram = () => {
    const mapUrl = `${
      process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
    }/maps/${mapId}`;
    const caption = `🗺️ Check out my travel map "${mapName}" on TripMaps!\n\n${mapUrl}\n\n#travel #maps #tripmaps #travelmap #adventure #explore #wanderlust`;

    // Copy caption to clipboard
    navigator.clipboard
      .writeText(caption)
      .then(() => {
        toast.success("Caption copied! Opening Instagram...");

        // Try to open Instagram app first (mobile), then fallback to web
        const instagramAppUrl = `instagram://library?AssetPickerSourceType=1&AssetPickerMediaType=1&AssetPickerCaption=${encodeURIComponent(
          caption
        )}`;

        // Create a hidden link to test if Instagram app is available
        const link = document.createElement("a");
        link.href = instagramAppUrl;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Fallback to Instagram web after a short delay
        setTimeout(() => {
          window.open("https://www.instagram.com/", "_blank");
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to copy caption");
      });
  };

  const createMapImage = async () => {
    try {
      // Create a custom map image with Instagram post dimensions (1:1 aspect ratio)
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 1080; // Instagram recommended width
      canvas.height = 1080; // Instagram recommended height (1:1 aspect ratio)

      // Set background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load a random map background image
      const randomMapNumber = Math.floor(Math.random() * 5) + 1; // 1-5
      const mapBackground = new Image();
      mapBackground.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        mapBackground.onload = () => {
          // Draw the map background
          ctx.drawImage(mapBackground, 0, 0, canvas.width, canvas.height);
          resolve();
        };
        mapBackground.onerror = () => {
          // Fallback to gradient if image fails to load
          const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
          );
          gradient.addColorStop(0, "#667eea");
          gradient.addColorStop(1, "#764ba2");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          resolve();
        };
        mapBackground.src = `/maps/map${randomMapNumber}.webp`;
      });

      // Add a semi-transparent overlay for better text readability
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add map title with shadow and better styling
      ctx.fillStyle = "#000000";
      ctx.font = "bold 72px Arial, sans-serif";
      ctx.textAlign = "center";

      // Add text shadow for better readability
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(
        mapName?.toUpperCase() || "TRAVEL MAP",
        canvas.width / 2,
        200
      );

      // Reset shadow for other elements
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Add subtitle with better styling
      ctx.font = "bold 36px Arial, sans-serif";
      ctx.fillStyle = "#333333";
      ctx.fillText("Created with TripMaps", canvas.width / 2, 260);

      // Add location count if available
      if (pois && pois.length > 0) {
        ctx.font = "bold 32px Arial, sans-serif";
        ctx.fillStyle = "#444444";
        ctx.fillText(`${pois.length} locations visited`, canvas.width / 2, 310);
      }

      // Add map icon with background
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.beginPath();
      ctx.arc(canvas.width / 2, 450, 80, 0, 2 * Math.PI);
      ctx.fill();

      ctx.font = "100px Arial, sans-serif";
      ctx.fillStyle = "#000000";
      ctx.fillText("🗺️", canvas.width / 2, 480);

      // Add decorative elements with better styling
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(200, 550);
      ctx.lineTo(canvas.width - 200, 550);
      ctx.stroke();

      // Add website URL with background
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillRect(canvas.width / 2 - 100, 650, 200, 40);

      ctx.font = "bold 28px Arial, sans-serif";
      ctx.fillStyle = "#000000";
      ctx.fillText("mytripmaps.com", canvas.width / 2, 675);

      // Add location markers if POIs are available
      if (pois && pois.length > 0) {
        const locations = pois.slice(0, 5); // Show first 5 locations
        locations.forEach((poi, index) => {
          const x = 200 + index * 160;
          const y = 800;

          // Location marker background
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(x, y, 12, 0, 2 * Math.PI);
          ctx.fill();

          // Location marker
          ctx.fillStyle = "#ff6b6b";
          ctx.beginPath();
          ctx.arc(x, y, 8, 0, 2 * Math.PI);
          ctx.fill();

          // Location name with background
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(x - 60, y + 15, 120, 25);

          ctx.fillStyle = "#000000";
          ctx.font = "bold 16px Arial, sans-serif";
          ctx.textAlign = "center";
          const displayName =
            poi.locationName?.length > 12
              ? poi.locationName.substring(0, 12) + "..."
              : poi.locationName;
          ctx.fillText(displayName || "Location", x, y + 32);
        });
      } else {
        // Fallback to emoji markers if no POIs
        const emojiMarkers = ["📍", "🗺️", "🌍", "✈️", "🏖️"];
        emojiMarkers.forEach((marker, index) => {
          const x = 200 + index * 160;
          const y = 800;

          // Emoji background
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, 2 * Math.PI);
          ctx.fill();

          ctx.font = "40px Arial, sans-serif";
          ctx.fillStyle = "#000000";
          ctx.fillText(marker, x, y + 15);

          // Location text background
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(x - 60, y + 35, 120, 25);

          ctx.fillStyle = "#000000";
          ctx.font = "bold 16px Arial, sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Location", x, y + 52);
        });
      }

      // Convert to blob and download
      canvas.toBlob(
        (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${mapName || "trip-map"}-instagram.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          const caption = `🗺️ Check out my travel map "${mapName}" on TripMaps!\n\n${mapUrl}\n\n#travel #maps #tripmaps #travelmap #adventure #explore #wanderlust`;
          navigator.clipboard.writeText(caption);
          toast.success("Instagram-ready map image created & caption copied!");
        },
        "image/png",
        0.9
      );
    } catch (error) {
      console.error("Image creation error:", error);
      toast.error("Failed to create map image. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl border border-purple-300 shadow-sm">
      <div
        className="tooltip tooltip-left"
        data-tip="📸 Copy caption & open Instagram"
      >
        <button
          onClick={shareToInstagram}
          className="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-105"
        >
          <Instagram size={16} />
        </button>
      </div>
      <div
        className="tooltip tooltip-left"
        data-tip="🎨 Create Instagram-ready image"
      >
        <button
          onClick={createMapImage}
          className="btn btn-circle btn-sm bg-white/20 hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200 hover:scale-105"
        >
          <Camera size={16} />
        </button>
      </div>
    </div>
  );
};

export default InstagramShare;
