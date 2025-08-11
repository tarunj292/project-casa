import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// --- small loader for Google Maps JS API (Places) ---
function loadGoogleMaps(apiKey: string): Promise<void> {
  if ((window as any).google?.maps?.places) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-script");
    if (existing) {
      (existing as HTMLScriptElement).onload = () => resolve();
      (existing as HTMLScriptElement).onerror = reject;
      return;
    }
    const s = document.createElement("script");
    s.id = "google-maps-script";
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

// --- helpers to pull components safely from a Place result ---
type AddressComponents = google.maps.GeocoderAddressComponent[];

const getComp = (comps: AddressComponents, type: string) =>
  comps.find((c) => c.types.includes(type));

function parseAddressComponents(place: google.maps.places.PlaceResult) {
  const comps = (place.address_components || []) as AddressComponents;

  const city =
    getComp(comps, "locality")?.long_name ||
    getComp(comps, "postal_town")?.long_name ||
    getComp(comps, "administrative_area_level_2")?.long_name ||
    "";

  const state =
    getComp(comps, "administrative_area_level_1")?.long_name || "";

  const pincode = getComp(comps, "postal_code")?.long_name || "";

  const country =
    getComp(comps, "country")?.long_name ||
    getComp(comps, "country")?.short_name ||
    "India";

  // A simple line for address (street + number if present)
  const route = getComp(comps, "route")?.long_name || "";
  const streetNumber = getComp(comps, "street_number")?.long_name || "";
  const sublocality =
    getComp(comps, "sublocality_level_1")?.long_name ||
    getComp(comps, "sublocality")?.long_name ||
    "";
  const formatted =
    place.formatted_address ||
    [streetNumber && `${streetNumber} `, route, sublocality, city]
      .filter(Boolean)
      .join(", ");

  return { city, state, pincode, country, formatted };
}

// --- validators (simple/for India) ---
const isEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const isIndianPhone = (v: string) =>
  /^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ""));

const isPincode = (v: string) => /^\d{6}$/.test(v.trim());

// --- types we’ll store ---
interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  addressSearch: string; // what user typed/selected
  addressLine: string;   // formatted street line
  city: string;
  state: string;
  pincode: string;
  country: string;       // default "India"
}

const defaults: DeliveryAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressSearch: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

const LocationPage: React.FC = () => {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const [loadingMaps, setLoadingMaps] = useState(true);

  const [form, setForm] = useState<DeliveryAddress>(() => {
    const cached = localStorage.getItem("deliveryAddress");
    return cached ? JSON.parse(cached) : defaults;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // load maps
  useEffect(() => {
    let mounted = true;
    loadGoogleMaps(apiKey)
      .then(() => mounted && setLoadingMaps(false))
      .catch(() => mounted && setLoadingMaps(false));
    return () => {
      mounted = false;
    };
  }, [apiKey]);

  // init autocomplete
  useEffect(() => {
    if (loadingMaps || !inputRef.current || autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current as HTMLInputElement, {
      types: ["geocode"],
      // componentRestrictions: { country: "in" } // lock to India if you want
    });
    ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      if (!place || !place.address_components) return;

      const parsed = parseAddressComponents(place);
      setForm((f) => ({
        ...f,
        addressSearch: (inputRef.current?.value || "").trim(),
        addressLine: parsed.formatted,
        city: parsed.city,
        state: parsed.state,
        pincode: parsed.pincode,
        country: parsed.country || "India",
      }));
    });

    autocompleteRef.current = ac;
  }, [loadingMaps]);

  // handle inputs
  const update = (key: keyof DeliveryAddress, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // validate
  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!isIndianPhone(form.phone)) e.phone = "Invalid Indian number";
    if (!isEmail(form.email)) e.email = "Invalid email";
    if (!form.addressSearch.trim()) e.addressSearch = "Pick an address";
    if (!form.city.trim()) e.city = "City required";
    if (!form.state.trim()) e.state = "State required";
    if (!isPincode(form.pincode)) e.pincode = "6-digit pincode";
    if (!form.country.trim()) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const canSave = useMemo(() => {
    return (
      form.fullName.trim().length > 0 &&
      isIndianPhone(form.phone) &&
      isEmail(form.email) &&
      form.city.trim().length > 0 &&
      form.state.trim().length > 0 &&
      isPincode(form.pincode) &&
      form.country.trim().length > 0 &&
      form.addressSearch.trim().length > 0
    );
  }, [form]);

  const handleSave = () => {
    if (!validate()) return;

    localStorage.setItem("deliveryAddress", JSON.stringify(form));
    // if you have a backend, POST it here too.
    // await fetch('/api/users/address', { method:'POST', body: JSON.stringify(form) })
    navigate(-1); // go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm opacity-70 hover:opacity-100"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Delivery Details</h1>
          <div className="w-8" />
        </div>

        {/* Contact */}
        <div className="bg-gray-900 rounded-2xl p-4 shadow-lg mb-4">
          <h2 className="text-base font-medium mb-3 opacity-90">Contact</h2>
          <div className="grid gap-3">
            <div>
              <label className="text-sm opacity-80">Full Name</label>
              <input
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="E.g., Jay Lulia"
                className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.fullName && (
                <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm opacity-80">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98XXXXXXXX"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.phone && (
                  <p className="text-xs text-red-400 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="text-sm opacity-80">Email</label>
                <input
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
          <h2 className="text-base font-medium mb-3 opacity-90">Address</h2>

          <div className="mb-3">
            <label className="text-sm opacity-80">Search Address</label>
            <input
              ref={inputRef}
              value={form.addressSearch}
              onChange={(e) => update("addressSearch", e.target.value)}
              placeholder="Start typing and pick from suggestions"
              className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loadingMaps}
            />
            {errors.addressSearch && (
              <p className="text-xs text-red-400 mt-1">
                {errors.addressSearch}
              </p>
            )}
            {loadingMaps && (
              <p className="text-xs mt-1 opacity-70">Loading maps…</p>
            )}
          </div>

          <div className="mb-3">
            <label className="text-sm opacity-80">Address Line</label>
            <input
              value={form.addressLine}
              onChange={(e) => update("addressLine", e.target.value)}
              placeholder="Flat / House / Street"
              className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm opacity-80">City</label>
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.city && (
                <p className="text-xs text-red-400 mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label className="text-sm opacity-80">State</label>
              <input
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.state && (
                <p className="text-xs text-red-400 mt-1">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-sm opacity-80">Pincode</label>
              <input
                value={form.pincode}
                onChange={(e) => update("pincode", e.target.value)}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.pincode && (
                <p className="text-xs text-red-400 mt-1">{errors.pincode}</p>
              )}
            </div>
            <div>
              <label className="text-sm opacity-80">Country</label>
              <input
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.country && (
                <p className="text-xs text-red-400 mt-1">{errors.country}</p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`mt-5 w-full rounded-xl px-4 py-3 font-semibold transition
              ${canSave ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-700 opacity-60 cursor-not-allowed"}`}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
