import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CarFront, MapPin, Tag, Settings, Flame, AlertCircle, CheckCircle2,
  Calendar, Car, Droplet, ArrowRight, ArrowLeft, Image as ImageIcon
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import ImageUploader from "../components/ImageUploader";
import LocationPickerMap from "../components/vehicle/LocationPickerMap";

const API = "http://localhost:5000";

const AddVehiclePage = () => {
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [form, setForm] = useState({
    name: "", brand: "", model: "", year: "",
    type: "Sedan", seats: "4", transmission: "Automatic", fuel: "Petrol",
    condition: "Excellent", mileage: "",
    pricePerDay: "", location: "Kathmandu", latitude: "", longitude: "",
    available: "true", description: "",
  });
  const [exteriorImages, setExteriorImages] = useState([]);
  const [interiorImages, setInteriorImages] = useState([]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { setIsVerified(false); return; }
        const res = await axios.get(`${API}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        const user = res.data;
        setIsVerified(user.isVerifiedOwner || user.role === "admin");
      } catch { setIsVerified(false); }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchVehicle = async () => {
        try {
          const res = await axios.get(`${API}/api/vehicles/${id}`);
          const v = res.data;
          setForm({
            name: v.name, brand: v.brand, model: v.model, year: v.year,
            type: v.type, seats: v.seats, transmission: v.transmission,
            fuel: v.fuel, condition: v.condition || "Excellent", mileage: v.mileage || "",
            pricePerDay: v.pricePerDay, location: v.location,
            latitude: v.latitude || "", longitude: v.longitude || "",
            available: v.available.toString(), description: v.description || "",
          });
        } catch { setError("Failed to fetch vehicle details"); }
      };
      fetchVehicle();
    }
  }, [id, isEditing]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validateStep = () => {
    if (step === 1) return form.name && form.brand && form.model && form.year;
    if (step === 2) return form.type && form.seats && form.transmission && form.fuel && form.condition;
    if (step === 3) return form.location || (form.latitude && form.longitude);
    if (step === 5) return form.pricePerDay;
    return true;
  };

  const handleNext = () => {
    setError("");
    if (!validateStep()) { setError("Please fill all required fields before proceeding."); return; }
    setStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrev = () => {
    setError("");
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUseMyLocation = () => {
    setError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const address = res.data.address;
            const locName = address.city || address.town || address.village || address.suburb || res.data.display_name.split(',')[0];
            setForm(prev => ({ ...prev, latitude: lat, longitude: lng, location: locName }));
          } catch (err) {
            console.error("Geocoding error", err);
            setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
          }
        },
        () => setError("Failed to get location. Please allow location access.")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const handleSubmit = async () => {
    setError(""); setMsg(""); setLoading(true);
    if (!validateStep()) { setError("Please ensure all details are correct."); setLoading(false); return; }
    try {
      if (isEditing) {
        const token = localStorage.getItem("token");
        await axios.put(`${API}/api/vehicles/${id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setMsg("Vehicle updated successfully.");
      } else {
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        exteriorImages.forEach(img => fd.append("exteriorImages", img));
        interiorImages.forEach(img => fd.append("interiorImages", img));
        const token = localStorage.getItem("token");
        await axios.post(`${API}/api/vehicles`, fd, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
        });
        setMsg("Car added successfully! Redirecting...");
        setTimeout(() => navigate("/seller/fleet"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "Failed to save vehicle.");
    } finally {
      setLoading(false);
    }
  };

  // Compact selection card
  const SelectCard = ({ active, onClick, icon: Icon, label }) => (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center gap-1.5 transition-all text-center ${
        active
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100"
          : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
      }`}
    >
      {Icon && <Icon size={18} />}
      <span className="text-xs font-bold">{label}</span>
    </div>
  );

  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-5">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Access Denied</h2>
        <p className="text-slate-500 mb-6 text-sm">You must be a verified owner to list vehicles.</p>
        <Button onClick={() => navigate("/apply-owner")}>Apply to Become an Owner</Button>
      </div>
    );
  }

  const stepLabels = ["Basic Info", "Specs", "Location", "Images", "Pricing"];
  const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  return (
    <div className="w-full font-body">
      <div className="max-w-3xl mx-auto">

        {/* ── Compact header ── */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditing ? "Edit Vehicle" : "List Your Car"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Step {step} of {totalSteps} — {stepLabels[step - 1]}
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400 px-3 py-1 rounded-full">
              {pct}% done
            </span>
          </div>

          {/* slim progress bar */}
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full">
            <div
              className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            {stepLabels.map((label, idx) => (
              <span key={label} className={`text-[9px] font-bold uppercase tracking-wider ${
                step === idx + 1 ? "text-indigo-600" : step > idx + 1 ? "text-slate-400" : "text-slate-300 dark:text-slate-600"
              }`}>{label}</span>
            ))}
          </div>
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}
        {msg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
            <CheckCircle2 size={15} /> {msg}
          </div>
        )}

        {/* ── Card with step content + buttons inside ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="p-6 sm:p-8"
            >
              {/* ── Step 1: Basic Info ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Basic Information</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Primary details about your vehicle.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Vehicle Full Name" name="name" value={form.name} onChange={onChange} required placeholder="e.g. Honda Civic Type R" icon={CarFront} />
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Brand</label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                          list="brands" name="brand" value={form.brand} onChange={onChange}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g. Toyota"
                        />
                        <datalist id="brands">
                          {["Toyota","Honda","Hyundai","Ford","BMW","Mercedes","Kia","Suzuki","Nissan"].map(b => <option key={b} value={b} />)}
                        </datalist>
                      </div>
                    </div>
                    <Input label="Model" name="model" value={form.model} onChange={onChange} required placeholder="e.g. Civic" icon={Settings} />
                    <Input label="Year" type="number" name="year" value={form.year} onChange={onChange} required placeholder="e.g. 2023" icon={Calendar} />
                  </div>
                </div>
              )}

              {/* ── Step 2: Specs ── */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Specifications</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Mechanical and structural details.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Vehicle Type</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {["Sedan","SUV","Hatchback","Pickup","Luxury","Sports"].map(t => (
                        <SelectCard key={t} label={t} active={form.type === t} icon={Car} onClick={() => setForm({...form, type: t})} />
                      ))}
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Transmission</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Automatic","Manual"].map(t => (
                          <SelectCard key={t} label={t} active={form.transmission === t} icon={Settings} onClick={() => setForm({...form, transmission: t})} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Fuel</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Petrol","Diesel","Electric","Hybrid"].map(t => (
                          <SelectCard key={t} label={t} active={form.fuel === t} icon={Droplet} onClick={() => setForm({...form, fuel: t})} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Condition</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Excellent","Good","Fair","Like New"].map(t => (
                          <SelectCard key={t} label={t} active={form.condition === t} onClick={() => setForm({...form, condition: t})} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Seats</label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                        <button onClick={() => setForm({...form, seats: Math.max(2, parseInt(form.seats)-1).toString()})} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-white hover:bg-slate-50">−</button>
                        <span className="text-xl font-black text-slate-900 dark:text-white w-6 text-center">{form.seats}</span>
                        <button onClick={() => setForm({...form, seats: Math.min(10, parseInt(form.seats)+1).toString()})} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-slate-600 dark:text-white hover:bg-slate-50">+</button>
                      </div>
                    </div>
                    <Input label="Mileage / Range" name="mileage" value={form.mileage} onChange={onChange} placeholder="e.g. 15 km/l" icon={Flame} />
                  </div>
                </div>
              )}

              {/* ── Step 3: Location ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Pickup Location</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Where will the renter pick up the car?</p>
                  </div>
                  <Input label="Location / Address" name="location" value={form.location} onChange={onChange} icon={MapPin} placeholder="e.g. Naxal, Kathmandu" />
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <LocationPickerMap
                      latitude={form.latitude ? Number(form.latitude) : null}
                      longitude={form.longitude ? Number(form.longitude) : null}
                      onLocationSelect={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                    />
                  </div>
                  <button type="button" onClick={handleUseMyLocation} className="w-full py-2.5 text-sm font-bold text-indigo-600 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center gap-2">
                    <MapPin size={15} /> Use my current location
                  </button>
                </div>
              )}

              {/* ── Step 4: Images ── */}
              {step === 4 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Vehicle Images</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Great photos get 5× more bookings.</p>
                  </div>
                  {!isEditing ? (
                    <div className="space-y-6">
                      <ImageUploader title="Exterior Images (Max 5)" maxImages={5} images={exteriorImages} setImages={setExteriorImages} />
                      <div className="h-px bg-slate-100 dark:bg-slate-800" />
                      <ImageUploader title="Interior Images (Max 5)" maxImages={5} images={interiorImages} setImages={setInteriorImages} />
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 p-4 rounded-xl border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-sm">
                      <ImageIcon size={18} className="shrink-0 mt-0.5" />
                      <p>Image editing is disabled in edit mode. Delete and re-list the vehicle to change images.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 5: Pricing ── */}
              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Pricing &amp; Review</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Set your rate and confirm your listing.</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Price per day (NPR)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Rs.</span>
                          <input
                            type="number" name="pricePerDay" value={form.pricePerDay} onChange={onChange} required
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-indigo-900 dark:text-indigo-300 font-black text-2xl"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Availability</label>
                        <select name="available" value={form.available} onChange={onChange} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-slate-300">
                          <option value="true">Available Now</option>
                          <option value="false">Not Available</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Description</label>
                        <textarea name="description" value={form.description} onChange={onChange} rows={4} className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none" placeholder="Features, rules, condition..." />
                      </div>
                    </div>
                    {/* Preview */}
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2 block">Listing Preview</label>
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                        <div className="w-full h-32 bg-slate-200 dark:bg-slate-700 rounded-xl mb-3 overflow-hidden">
                          {exteriorImages.length > 0 ? (
                            <img src={URL.createObjectURL(exteriorImages[0])} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                              <ImageIcon size={24} className="text-slate-300" />
                              <span className="text-xs text-slate-400">No image</span>
                            </div>
                          )}
                        </div>
                        <p className="font-black text-sm text-slate-900 dark:text-white">{form.brand || "Brand"} {form.model || "Model"}</p>
                        <p className="text-xs text-slate-400 mt-0.5 mb-3">{form.year} · {form.type} · {form.transmission}</p>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin size={11} className="text-indigo-500" />{form.location || "–"}</span>
                          <span className="font-black text-indigo-600 dark:text-indigo-400">Rs. {form.pricePerDay || "0"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigation buttons — inside the card ── */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handlePrev}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${step === 1 ? "invisible" : ""}`}
                >
                  <ArrowLeft size={15} /> Back
                </button>

                {step < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors shadow-sm"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl transition-all shadow-sm disabled:opacity-60"
                  >
                    {loading ? "Saving..." : (isEditing ? "Save Changes" : "Submit Vehicle")}
                    {!loading && <CheckCircle2 size={15} />}
                  </button>
                )}
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default AddVehiclePage;
