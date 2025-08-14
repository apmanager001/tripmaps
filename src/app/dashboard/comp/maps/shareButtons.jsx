"use client";
import React, { useEffect, useState } from "react";
import { Link, Share2 } from "lucide-react";
import toast from "react-hot-toast";
// import { useParams } from "next/navigation";
import { SocialIcon } from "react-social-icons";

const SharedButtons = ({ id, name }) => {
  //   const { id } = useParams();

  const [link, setLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullURL = `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
      }/maps/${id}`;
      setLink(encodeURI(fullURL));
    }
  }, [id]);

  const msg = encodeURIComponent("Check out my trip map!");
  //   const shareTitle = encodeURIComponent(link);

  function copyURL() {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const url = `${
        process.env.NEXT_PUBLIC_SITE_URL || "https://mytripmaps.com"
      }/maps/${id}`;
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success("URL Copied!");
        })
        .catch(() => {
          toast.error("Failed to copy the URL");
        });
    }
  }

  return (
    <div className="flex items-center justify-center w-full my-2 gap-3">
      {/* Copy URL Button */}
      <div className="tooltip tooltip-bottom" data-tip="Copy URL to clipboard">
        <button
          onClick={copyURL}
          className="btn btn-circle btn-sm btn-outline hover:btn-primary transition-all duration-200 hover:scale-105"
        >
          <Link size={16} />
        </button>
      </div>

      {/* Social Share Buttons */}
      <div className="flex items-center gap-2 p-2 bg-base-200/50 backdrop-blur-sm rounded-2xl border border-base-300 shadow-sm">
        <div className="tooltip tooltip-bottom" data-tip="Share to Threads">
          <SocialIcon
            network="threads"
            style={{
              height: 32,
              width: 32,
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            className="hover:scale-110 transition-transform duration-200"
            url={`https://threads.net/intent/post?text=${msg}%20${link}`}
            target="_blank"
          />
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Share to Facebook">
          <SocialIcon
            network="facebook"
            style={{
              height: 32,
              width: 32,
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            className="hover:scale-110 transition-transform duration-200"
            url={`https://www.facebook.com/share.php?u=${link}`}
            target="_blank"
          />
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Share to Reddit">
          <SocialIcon
            network="reddit"
            style={{
              height: 32,
              width: 32,
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            className="hover:scale-110 transition-transform duration-200"
            url={`http://www.reddit.com/submit?url=${link}&title=${name}&text=${msg}`}
            target="_blank"
          />
        </div>

        <div className="tooltip tooltip-bottom" data-tip="Share to X (Twitter)">
          <SocialIcon
            network="x"
            style={{
              height: 32,
              width: 32,
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            className="hover:scale-110 transition-transform duration-200"
            url={`https://x.com/share?&text=${msg}&url=${link}`}
            target="_blank"
          />
        </div>
      </div>
    </div>
  );
};

export default SharedButtons;
