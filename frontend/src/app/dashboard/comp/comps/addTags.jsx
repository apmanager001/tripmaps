"use client";
import { useState, useEffect, useRef } from "react";
import { Plus, X, Check, Search } from "lucide-react";
import { tagApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const AddTags = ({
  onTagAdd,
  onTagRemove,
  existingTags = [],
  placeholder = "Search Tags...",
  className = "",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch all available tags
  const { data: allTags = [], refetch: refetchTags } = useQuery({
    queryKey: ["availableTags"],
    queryFn: async () => {
      try {
        const response = await tagApi.getAllTags();
        return response.data || [];
      } catch (error) {
        console.error("Error fetching tags:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Filter tags based on input and exclude existing tags
  const filteredTags = allTags.filter((tag) => {
    const matchesInput = tag.name
      .toLowerCase()
      .includes(inputValue.toLowerCase());
    const notAlreadyAdded = !existingTags.includes(tag.name);
    return matchesInput && notAlreadyAdded;
  });

  // Check if input value is a new tag (not in database)
  const isNewTag =
    inputValue.trim() &&
    !allTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    ) &&
    !existingTags.includes(inputValue);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Set dropdown open if there's input
    const shouldOpen = value.length > 0;
    setIsDropdownOpen(shouldOpen);
    setSelectedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Show dropdown if there's input or if user is actively typing
    if (inputValue.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    // Delay closing to allow for clicks on dropdown items
    setTimeout(() => {
      setIsDropdownOpen(false);
      setSelectedIndex(-1);
    }, 300);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredTags.length + (isNewTag ? 1 : 0) - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredTags.length + (isNewTag ? 1 : 0) - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < filteredTags.length) {
            // Select existing tag
            handleTagSelect(filteredTags[selectedIndex].name);
          } else if (isNewTag) {
            // Create new tag
            handleCreateNewTag();
          }
        } else if (isNewTag) {
          // Create new tag if no selection
          handleCreateNewTag();
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle tag selection
  const handleTagSelect = (tagName) => {
    onTagAdd(tagName);
    setInputValue("");
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
  };

  // Handle creating new tag
  const handleCreateNewTag = async () => {
    const tagName = inputValue.trim();
    if (!tagName) return;

    setIsCreating(true);
    try {
      const response = await tagApi.createTag(tagName);
      if (response.success) {
        toast.success(`Tag "${tagName}" created successfully!`);
        onTagAdd(tagName);
        setInputValue("");
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        // Refetch tags to include the new one
        refetchTags();
      } else {
        toast.error(response.message || "Failed to create tag");
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error(`Failed to create tag: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle removing existing tag
  const handleRemoveTag = (tagName) => {
    if (onTagRemove) {
      onTagRemove(tagName);
    } else {
      // Fallback to toast if no callback provided
      toast.success(`Tag "${tagName}" removed`);
    }
  };

  return (
    <div className={`relative ${className} flex flex-col gap-2`}>
      {/* Existing tags display */}
      {existingTags.length > 0 && (
        <div className=" flex flex-wrap gap-1">
          {existingTags.map((tag, index) => (
            <span
              key={index}
              className="badge badge-primary badge-sm flex items-center justify-center gap-1 py-3"
            >
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="">
                <X size={12} className="hover:text-neutral cursor-pointer" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <div className="relative w-full flex items-center">
          <label
            htmlFor="add-tags-input"
            className="input input-sm w-full pr-10 flex items-center gap-2"
          >
            <Search size={16} className="text-neutral" />

            <input
              id="add-tags-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={(e) => {
                handleInputFocus();
                // Scroll to input on focus
                setTimeout(() => {
                  const el = document.getElementById("add-tags-input");
                  if (el)
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 0);
              }}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="grow"
              disabled={isCreating || disabled}
              autoComplete="off"
            />
          </label>
          {inputValue && (
            <button
              onClick={() => {
                setInputValue("");
                setIsDropdownOpen(false);
                setSelectedIndex(-1);
              }}
              className="absolute right-2 btn btn-circle btn-ghost btn-xs z-40"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-10 mt-1 border bg-base-300 border-neutral rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {/* Existing tags */}
            {filteredTags.map((tag, index) => (
              <div
                key={tag._id}
                onClick={() => handleTagSelect(tag.name)}
                className={`px-4 py-2 cursor-pointer hover:bg-base-100 flex items-center justify-between ${
                  selectedIndex === index ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-sm ">{tag.name}</span>
                <Check size={14} className="text-green-500" />
              </div>
            ))}

            {/* Create new tag option */}
            {isNewTag && (
              <div
                onClick={handleCreateNewTag}
                className={`px-4 py-2 cursor-pointer hover:bg-green-200 border-t border-neutral flex items-center justify-between ${
                  selectedIndex === filteredTags.length ? "bg-green-300" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-green-400" />
                  <span className="text-md text-green-400 font-medium">
                    Create "{inputValue}"
                  </span>
                </div>
                {isCreating && (
                  <div className="loading loading-spinner loading-xs text-green-500"></div>
                )}
              </div>
            )}

            {/* No results */}
            {filteredTags.length === 0 && !isNewTag && inputValue && (
              <div className="px-4 py-2 text-sm text-gray-500">
                No tags found. Type to create a new one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddTags;
