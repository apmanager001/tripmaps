import React, { useState, useRef } from "react";
import {
  useSearchCountries,
  useVisitedCountries,
  useAddVisitedCountry,
  useRemoveVisitedCountry,
} from "../../../../components/visitedCountrys";
import toast from "react-hot-toast";
import {useAuthStore} from "../../../../store/useAuthStore";


const Country = () => {
    const { user } = useAuthStore();
    const userId = user?._id;
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const { data: countries = [], isLoading } = useSearchCountries(search);
  const { data: visited = [] } = useVisitedCountries(userId);
  const addVisited = useAddVisitedCountry(userId);
  const removeVisited = useRemoveVisitedCountry(userId);

  const handleChange = (e) => {
    setSearch(e.target.value);
    setShowDropdown(true);
  };

  const handleAdd = (country) => {
    if (!userId) return;
    addVisited.mutate(country._id);
    toast.success("Country added to visited list");
    setSearch("");
    setShowDropdown(false);
  };

  const handleRemove = (countryId) => {
    if (!userId) return;
    removeVisited.mutate(countryId);
    toast.success("Country removed from visited list");
  };

  // Hide dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Visited countries badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {visited &&
          visited.length > 0 &&
          visited.map((country) => (
            <span
              key={country._id}
              className="badge badge-primary gap-2 items-center"
            >
              {/* <span>
                {country.flagUrl ? (
                  <img
                    src={country.flagUrl}
                    alt={country.name}
                    className="inline w-5 h-5 mr-1"
                  />
                ) : null}
              </span> */}
              <span className="font-bold">{country.name}</span>
              <button
                type="button"
                className="ml-1 hover:text-neutral cursor-pointer font-extrabold"
                onClick={() => handleRemove(country._id)}
                aria-label={`Remove ${country.name}`}
              >
                ×
              </button>
            </span>
          ))}
      </div>
      <fieldset className="fieldset" ref={inputRef}>
        <legend className="fieldset-legend">Search Country</legend>
        <input
          type="text"
          placeholder="Type country name..."
          className="input w-full"
          value={search}
          onChange={handleChange}
          onFocus={() => setShowDropdown(true)}
        />
        {showDropdown && search && (
          <ul className="dropdown-content menu p-2 mt-10 shadow bg-base-100 rounded-b-box z-10 max-h-60 overflow-auto border border-base-neutral absolute">
            {isLoading ? (
              <li className="p-2">Loading...</li>
            ) : countries.length === 0 ? (
              <li className="p-2">No countries found</li>
            ) : (
              countries.slice(0, 5).map((country) => (
                <li key={country._id || country.code}>
                  <button
                    type="button"
                    className="w-full text-left px-2 py-1 hover:bg-neutral"
                    onClick={() => handleAdd(country)}
                  >
                    <span className="mr-2">{country.emoji}</span>
                    {country.name}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </fieldset>
    </>
  );
};

export default Country;
