"use client";
import { useEffect, useState } from "react";
import { Newspaper, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

const AdminNewsletter = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // align base URL with other callers and ensure same-origin/session handling
  const backendURL = process.env.NEXT_PUBLIC_BACKEND || "http://localhost:4000";
    useEffect(() => {
        const handleNewsletterGet = async (e) => {
            if (e && e.preventDefault) e.preventDefault();
            setLoading(true);
            try {
            const res = await fetch(`${backendURL}/newsletter`, {
                method: "GET",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(`Failed to load: ${res.status} ${txt}`);
            }
            const json = await res.json();
            // API may return { data: [...] } or an array directly
            const list = Array.isArray(json.data)
                ? json.data
                : Array.isArray(json)
                ? json
                : [];
            setData(list);
            } catch (err) {
            console.error(err);
            toast.error(err.message || "Network error");
            } finally {
            setLoading(false);
            }
        };
        handleNewsletterGet();
        }, []);

  const toggleDropdown = async () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  return (
    <div className="bg-base-200 md:rounded-xl md:shadow-lg border border-base-300 overflow-hidden">
      {/* Trigger Button */}
      <div className="md:p-6">
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-between w-full p-6 bg-base-200 rounded-xl  transition-all duration-200 "
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Newspaper size={24} className="text-primary" />
            </div>
            <div className="indicator">
              <span className="indicator-item badge badge-primary ">
                {data.length}
              </span>
              <div className="text-left pr-4">
                <h3 className="text-xl font-semibold text-primary">
                  Newsletter Subscribers
                </h3>
              </div>
            </div>
          </div>
          {isDropdownOpen ? (
            <ChevronUp size={24} className="text-primary cursor-pointer" />
          ) : (
            <ChevronDown size={24} className="text-primary cursor-pointer" />
          )}
        </button>
      </div>
      {/* Dropdown Content */}
      {isDropdownOpen && (
        <div className="p-6 border-t border-base-100 bg-base-200">
          {loading ? (
            <div className="text-sm text-neutral">Loading subscribers...</div>
          ) : data.length === 0 ? (
            <div className="text-sm text-neutral">No subscribers found.</div>
          ) : (
            <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.map((subscriber) => (
                <li
                  key={subscriber.id || subscriber.email}
                  className="p-3 bg-base-100 rounded-lg shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {subscriber.email}
                    </div>
                    {subscriber.name && (
                      <div className="text-xs text-neutral-500">
                        {subscriber.name}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-sm btn-ghost"
                      aria-label={`Send to ${subscriber.email}`}
                    >
                      Send
                    </button>
                    <button
                      className="btn btn-sm btn-ghost text-error"
                      aria-label={`Remove ${subscriber.email}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
