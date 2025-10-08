"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Trash2,
  Check,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const AdminGetContact = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState("new");

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND || "";
      const qs = statusFilter
        ? `?status=${encodeURIComponent(statusFilter)}`
        : "";
      const res = await fetch(`${API_BASE}/contact${qs}`, {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error("Not authorized to view contacts");
      }
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        // Avoid parsing HTML (e.g., login page) as JSON — read text but don't dump full HTML
        const text = (await res.text()) || "Unexpected non-JSON response";
        const snippet = text.replace(/\s+/g, " ").slice(0, 300);
        const hint =
          text.includes("<form") || text.includes("<!DOCTYPE")
            ? " (looks like an HTML page, possibly a login/redirect)"
            : "";
        throw new Error(
          snippet + (snippet.length < text.length ? "..." : "") + hint
        );
      }
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const json = await res.json();
      setContacts(json.data.contacts || []);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDropdownOpen) fetchContacts();
  }, [isDropdownOpen, statusFilter]);

  const viewContact = (c) => {
    setSelected(c);
  };

  const closeModal = () => setSelected(null);

  const resolveContact = async (id) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND || "";
      const res = await fetch(`${API_BASE}/contact/${id}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });
      if (res.status === 401 || res.status === 403)
        throw new Error("Not authorized");
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json") && !res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Marked resolved");
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to mark resolved");
    }
  };

  const deleteContact = async (id) => {
    if (!confirm("Delete this contact?")) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_BACKEND || "";
      const res = await fetch(`${API_BASE}/contact/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403)
        throw new Error("Not authorized");
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json") && !res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete");
      }
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Deleted");
      fetchContacts();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to delete contact");
    }
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
              <Users size={24} className="text-primary" />
            </div>
            <div className="indicator">
              <span className="indicator-item badge badge-primary ">
                {contacts.length}
              </span>
              <div className="text-left pr-4">
                <h3 className="text-xl font-semibold text-primary">
                  Contact Messages
                </h3>
                <p className="text-sm text-neutral-500">
                  Manage messages submitted by users
                </p>
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
          {/* Status Filter Tabs */}
          <div className="md:px-20 pb-4">
            <div className="flex items-center gap-2">
              <button
                className={`btn btn-sm ${
                  statusFilter === "new" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setStatusFilter("new")}
              >
                New
              </button>
              <button
                className={`btn btn-sm ${
                  statusFilter === "resolved" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setStatusFilter("resolved")}
              >
                Resolved
              </button>
              <button
                className={`btn btn-sm ${
                  statusFilter === "" ? "btn-primary" : "btn-ghost"
                }`}
                onClick={() => setStatusFilter("")}
              >
                All
              </button>
              <div className="ml-auto text-sm text-neutral-500">
                Showing:{" "}
                <span className="font-semibold">{statusFilter || "all"}</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">No contact messages</div>
          ) : (
            <ul className="space-y-4">
              {contacts.map((c) => (
                <li
                  key={c._id}
                  className="p-4 bg-base-100 rounded-lg border border-base-content/10"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong>{c.name}</strong>
                        <span className="text-sm text-neutral-500">
                          {c.email}
                        </span>
                        <span className="badge badge-sm ml-2">
                          {c.category}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                        {c.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => viewContact(c)}
                      >
                        <MessageCircle />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => resolveContact(c._id)}
                      >
                        <Check />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={() => deleteContact(c._id)}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-base-100 rounded-lg shadow-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">
                  {selected.subject || "Contact Message"}
                </h3>
                <p className="text-sm text-neutral-500">
                  From {selected.name} • {selected.email}
                </p>
              </div>
              <button className="btn btn-ghost" onClick={closeModal}>
                Close
              </button>
            </div>
            <div className="mt-4 text-neutral-700">
              <p>{selected.message}</p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="btn btn-sm"
                onClick={() => resolveContact(selected._id)}
              >
                Mark Resolved
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={() => deleteContact(selected._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGetContact;
