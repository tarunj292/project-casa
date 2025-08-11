import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ---------------- Config ---------------- */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

/* ---------------- Google Maps Places loader (bullet-proof) ---------------- */
function loadGoogleMaps(apiKey: string): Promise<void> {
  const w = window as any;
  if (w.google?.maps?.places?.Autocomplete) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existing = document.getElementById("google-maps-script") as HTMLScriptElement | null;

    const onReady = () => {
      // Ensure Places is actually loaded (some keys/projects load Maps without Places)
      if (w.google?.maps?.places?.Autocomplete) {
        resolve();
      } else {
        reject(
          new Error(
            "Google Maps loaded but Places library (Autocomplete) is missing. Enable Places API for your key."
          )
        );
      }
    };

    if (existing) {
      existing.onload = onReady;
      existing.onerror = () => reject(new Error("Failed to load Google Maps script."));
      return;
    }

    if (!apiKey) {
      reject(new Error("Google Maps API key missing."));
      return;
    }

    const s = document.createElement("script");
    s.id = "google-maps-script";
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=places&loading=async`;
    s.onload = onReady;
    s.onerror = () => reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(s);
  });
}

/* ---------------- Place parsing helpers ---------------- */
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

  const state = getComp(comps, "administrative_area_level_1")?.long_name || "";
  const pincode = getComp(comps, "postal_code")?.long_name || "";
  const country =
    getComp(comps, "country")?.long_name ||
    getComp(comps, "country")?.short_name ||
    "India";

  const route = getComp(comps, "route")?.long_name || "";
  const streetNumber = getComp(comps, "street_number")?.long_name || "";
  const sublocality =
    getComp(comps, "sublocality_level_1")?.long_name ||
    getComp(comps, "sublocality")?.long_name ||
    "";

  const formatted =
    place.formatted_address ||
    [streetNumber && `${streetNumber} `, route, sublocality, city].filter(Boolean).join(", ");

  return { city, state, pincode, country, formatted };
}

/* ---------------- Validators ---------------- */
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isIndianPhone = (v: string) => /^(?:\+?91[-\s]?)?[6-9]\d{9}$/.test(v.replace(/\s/g, ""));
const isPincode = (v: string) => /^\d{6}$/.test(v.trim());

/* ---------------- Types ---------------- */
interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  addressSearch: string;
  addressLine: string;
  flatNumber: string;
  wingBuilding: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

const defaults: DeliveryAddress = {
  fullName: "",
  phone: "",
  email: "",
  addressSearch: "",
  addressLine: "",
  flatNumber: "",
  wingBuilding: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
};

type Step = 1 | 2 | 3 | 4;

const LocationPage: React.FC = () => {
  const navigate = useNavigate();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;

  const [loadingMaps, setLoadingMaps] = useState(true);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<DeliveryAddress>(defaults);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  /* Build final one-line address safely */
  const finalAddress = useMemo(() => {
    return [
      form.flatNumber && form.wingBuilding
        ? `${form.flatNumber} ${form.wingBuilding}`
        : form.flatNumber || form.wingBuilding || "",
      form.addressLine || form.addressSearch,
      [form.city, form.state].filter(Boolean).join(", "),
      form.pincode,
      form.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [form]);

  /* Load Google Maps + Places */
  useEffect(() => {
    let mounted = true;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (!mounted) return;
        setLoadingMaps(false);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setMapsError(
          err?.message ||
            "Failed to load Google Maps. Check API key, billing, and that Places API is enabled."
        );
        setLoadingMaps(false);
      });

    return () => {
      mounted = false;
    };
  }, [apiKey]);

  /* Init Autocomplete (guarded) */
  useEffect(() => {
    const w = window as any;
    if (loadingMaps || mapsError) return;
    if (!inputRef.current) return;
    if (autocompleteRef.current) return;

    const Places = w.google?.maps?.places;
    if (!Places || !Places.Autocomplete) {
      console.warn("Places Autocomplete not available. Falling back to manual input.");
      setMapsError(
        "Address suggestions unavailable right now. You can still type your address manually."
      );
      return; // do not crash
    }

    try {
      const ac = new Places.Autocomplete(inputRef.current as HTMLInputElement, {
        types: ["geocode"],
        // componentRestrictions: { country: "in" }, // optional
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
    } catch (err) {
      console.error("Failed to initialize Places Autocomplete:", err);
      setMapsError(
        "Address suggestions failed to initialize. You can still type your address manually."
      );
    }
  }, [loadingMaps, mapsError]);

  /* Helpers */
  const update = (key: keyof DeliveryAddress, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (s: Step): boolean => {
    const e: Record<string, string> = {};
    if (s === 1 && !form.addressSearch.trim()) e.addressSearch = "Pick an address";
    if (s === 2) {
      if (!form.city.trim()) e.city = "City required";
      if (!form.state.trim()) e.state = "State required";
      if (!isPincode(form.pincode)) e.pincode = "6-digit pincode";
      if (!form.country.trim()) e.country = "Required";
    }
    if (s === 3) {
      if (!form.fullName.trim()) e.fullName = "Required";
      if (!isIndianPhone(form.phone)) e.phone = "Invalid number";
      if (!isEmail(form.email)) e.email = "Invalid email";
    }
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

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => (s === 4 ? 4 : ((s + 1) as Step)));
  };

  const back = () => setStep((s) => (s === 1 ? 1 : ((s - 1) as Step)));

  /* Resolve userId robustly (kept from your version) */
  const resolveUserId = async (): Promise<string | null> => {
    const keys = ["userData", "user", "currentUser"];
    for (const k of keys) {
      const raw = localStorage.getItem(k) || sessionStorage.getItem(k);
      if (!raw) continue;
      try {
        const obj = JSON.parse(raw);
        const id = obj?._id || obj?.id || obj?.user?._id || obj?.user?.id;
        if (id) {
          localStorage.setItem("userId", String(id));
          return String(id);
        }
      } catch (err) {
        console.warn(`Failed to parse ${k}:`, err);
      }
    }

    const directId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (directId) return String(directId);

    const phone =
      localStorage.getItem("phone") ||
      sessionStorage.getItem("phone") ||
      (form.phone?.trim() || "");
    if (phone) {
      try {
        const res = await axios.get(`${API_BASE}/users`, { params: { phone } });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const id = String(res.data[0]._id);
          localStorage.setItem("userId", id);
          return id;
        }
      } catch (e) {
        console.warn("User lookup by phone failed:", e);
      }
    }

    // Final fallback: create guest user (optional — remove if you don't want this)
    try {
      console.warn("No user found — creating guest account...");
      const guest = await axios.post(`${API_BASE}/users`, {
        phone: form.phone,
        email: form.email || `guest_${Date.now()}@example.com`,
        display_name: form.fullName || "Guest User",
      });
      if (guest.data?._id) {
        const id = String(guest.data._id);
        localStorage.setItem("userId", id);
        return id;
      }
    } catch (err) {
      console.error("Failed to create guest user:", err);
    }

    return null;
  };

  /* Save to backend */
  const handleSave = async () => {
    if (!canSave) return;
    try {
      const userId = await resolveUserId();
      if (!userId) {
        alert("Please log in again — we couldn't find or create your account.");
        return;
      }

      const payload = {
        billing_customer_name: form.fullName,
        billing_phone: form.phone,
        billing_email: form.email,
        billing_address: `${form.flatNumber} ${form.wingBuilding}`.trim(),
        billing_address_2: form.addressLine || form.addressSearch,
        billing_city: form.city,
        billing_pincode: String(form.pincode),
        billing_state: form.state,
        billing_country: form.country,
      };

      console.log("Saving address for user:", userId, payload);
      await axios.post(`${API_BASE}/users/${userId}/shipment`, payload, {
        // match your server CORS if you’re sending cookies
        withCredentials: false,
      });

      console.log("✅ Shipment address saved successfully");
      navigate(-1);
    } catch (err) {
      console.error("❌ Could not save address", err);
      alert("Could not save address. Please try again.");
    }
  };

  /* UI */
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="text-sm opacity-70 hover:opacity-100">
            ← Back
          </button>
          <h1 className="text-xl font-semibold">Delivery Details</h1>
          <div className="text-sm opacity-70">Step {step}/4</div>
        </div>

        {/* Step 1: Google Maps location search */}
        {step === 1 && (
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
            <h2 className="text-base font-medium mb-3 opacity-90">Locate Your Address</h2>

            <label className="text-sm opacity-80 mb-2 block">Search Address</label>
            <input
              ref={inputRef}
              value={form.addressSearch}
              onChange={(e) => update("addressSearch", e.target.value)}
              placeholder="Start typing and pick from suggestions"
              disabled={loadingMaps || !!mapsError}
              className="flex-1 h-10 rounded-full bg-gradient-to-br from-[#DAE8F7] to-[#D6E5F7] text-gray-900 placeholder-gray-500 px-3 outline-none text-[15px]"
            />
            {errors.addressSearch && (
              <p className="text-xs text-red-400 mt-2">{errors.addressSearch}</p>
            )}
            {loadingMaps && <p className="text-xs mt-2 opacity-70">Loading maps…</p>}
            {mapsError && <p className="text-xs mt-2 text-red-400">{mapsError}</p>}
            {form.addressLine && (
              <p className="text-sm opacity-80 mt-3">
                <span className="opacity-60">Detected:</span> {form.addressLine}
              </p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={next}
                className="flex-1 rounded-xl px-4 py-3 font-semibold bg-indigo-600 hover:bg-indigo-500"
              >
                Next: Address Fields
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Address fields (Flat/Wing + City/State/Pincode/Country) */}
        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
            <h2 className="text-base font-medium mb-3 opacity-90">Address Details</h2>

            {/* Flat + Wing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-sm opacity-80">Flat / House No.</label>
                <input
                  value={form.flatNumber}
                  onChange={(e) => update("flatNumber", e.target.value)}
                  placeholder="eg: 705"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.flatNumber && (
                  <p className="text-xs text-red-400 mt-1">{errors.flatNumber}</p>
                )}
              </div>
              <div>
                <label className="text-sm opacity-80">Wing / Building</label>
                <input
                  value={form.wingBuilding}
                  onChange={(e) => update("wingBuilding", e.target.value)}
                  placeholder="eg: A Wing"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.wingBuilding && (
                  <p className="text-xs text-red-400 mt-1">{errors.wingBuilding}</p>
                )}
              </div>
            </div>

            {/* City/State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm opacity-80">City</label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.city && <p className="text-xs text-red-400 mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-sm opacity-80">State</label>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state}</p>}
              </div>
            </div>

            {/* Pincode/Country */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm opacity-80">Pincode</label>
                <input
                  value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  inputMode="numeric"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.pincode && <p className="text-xs text-red-400 mt-1">{errors.pincode}</p>}
              </div>
              <div>
                <label className="text-sm opacity-80">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.country && <p className="text-xs text-red-400 mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={back} className="flex-1 rounded-xl px-4 py-3 font-semibold bg-gray-800 hover:bg-gray-700">
                Back
              </button>
              <button onClick={next} className="flex-1 rounded-xl px-4 py-3 font-semibold bg-indigo-600 hover:bg-indigo-500">
                Next: Contact Info
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
            <h2 className="text-base font-medium mb-3 opacity-90">Contact Information</h2>

            <div className="grid gap-3">
              <div>
                <label className="text-sm opacity-80">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="eg: John Doe"
                  className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
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
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="text-sm opacity-80">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-xl bg-gray-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={back} className="flex-1 rounded-xl px-4 py-3 font-semibold bg-gray-800 hover:bg-gray-700">
                Back
              </button>
              <button onClick={next} className="flex-1 rounded-xl px-4 py-3 font-semibold bg-indigo-600 hover:bg-indigo-500">
                Review & Confirm
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Confirm */}
        {step === 4 && (
          <div className="bg-gray-900 rounded-2xl p-4 shadow-lg">
            <h2 className="text-base font-medium mb-4 opacity-90">Review Address</h2>

            {/* Final one-line preview */}
            <div className="mb-4">
              <div className="opacity-70 text-sm mb-1">Final Address</div>
              <div className="bg-gray-800 rounded-xl p-3 text-sm">{finalAddress}</div>
            </div>

            {/* Detailed breakdown */}
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="opacity-70">Flat / House No.</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.flatNumber || "-"}</div>
                </div>
                <div>
                  <div className="opacity-70">Wing / Building</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.wingBuilding || "-"}</div>
                </div>
              </div>

              <div>
                <div className="opacity-70">Searched / Street Address</div>
                <div className="bg-gray-800 rounded-xl p-3">
                  {form.addressLine || form.addressSearch || "-"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="opacity-70">City</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.city}</div>
                </div>
                <div>
                  <div className="opacity-70">State</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.state}</div>
                </div>
                <div>
                  <div className="opacity-70">Pincode</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.pincode}</div>
                </div>
                <div>
                  <div className="opacity-70">Country</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.country}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="opacity-70">Full Name</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.fullName}</div>
                </div>
                <div>
                  <div className="opacity-70">Phone</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="opacity-70">Email</div>
                  <div className="bg-gray-800 rounded-xl p-3">{form.email}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={back}
                className="flex-1 rounded-xl px-4 py-3 font-semibold bg-gray-800 hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={!canSave}
                className={`flex-1 rounded-xl px-4 py-3 font-semibold ${
                  canSave ? "bg-indigo-600 hover:bg-indigo-500" : "bg-gray-700 cursor-not-allowed opacity-60"
                }`}
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPage;