/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCategories } from "../services/categoryService";
import { createEventRequest, type EventRequestData } from "../services/eventService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, MapPin, DollarSign, Tag, FileText, Send, Sparkles, Rocket } from "lucide-react";
import { motion } from "framer-motion";
import TiltCard from "../components/TiltCard";

// CategorySelect component
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, error }) => {
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="relative group">
      <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={18} />
      <select
        className={`w-full h-14 pl-12 pr-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 border border-white/40 dark:border-slate-800 outline-none transition-all focus:ring-2 focus:ring-purple-500/20 appearance-none cursor-pointer font-bold ${
          error ? "border-red-500/50" : ""
        }`}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      >
        <option value="" disabled>
          {isLoading ? "Loading Galaxy..." : queryError ? "Error Loading" : "Select Category"}
        </option>
        {Array.isArray(data) &&
          data.map((cat: any) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
         <SlidersHorizontal size={14} className="hidden" /> {/* Placeholder for alignment */}
      </div>
      {error && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2 ml-4">{error}</p>}
    </div>
  );
};

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    city: "",
    state: "",
    ticketType: "regular" as "regular" | "vip" | "premium",
    ticketPrice: "",
    ticketQuantity: "",
    tags: ""
  });
  
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = useMemo(() => {
    const step1 = Boolean(formData.title.trim() && formData.category);
    const step2 = Boolean(formData.startDate && formData.venueName.trim());
    const step3 = images.length >= 1;
    return [
      { name: "Concept", completed: step1, icon: Rocket },
      { name: "Venue", completed: step2, icon: MapPin },
      { name: "Assets", completed: step3, icon: Tag },
    ];
  }, [formData, images]);

  const createEventMutation = useMutation({
    mutationFn: createEventRequest,
    onSuccess: () => {
      toast.success("Blueprint Transmitted! Awaiting Admin Decryption.");
      navigate("/my-events");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Transmission Failed");
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title Missing";
    if (!formData.description.trim()) newErrors.description = "Mission intel required";
    if (!formData.category) newErrors.category = "Classification needed";
    if (!formData.startDate) newErrors.startDate = "Timeline unknown";
    if (!formData.venueName.trim()) newErrors.venueName = "Target location unknown";
    if (!formData.ticketPrice) newErrors.ticketPrice = "Credits not set";
    if (!formData.ticketQuantity) newErrors.ticketQuantity = "Capacity unknown";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const data: EventRequestData = {
      ...formData,
      venue: { name: formData.venueName, address: formData.venueAddress, city: formData.city, state: formData.state },
      ticketPricing: [{ type: formData.ticketType, price: parseFloat(formData.ticketPrice), quantity: parseInt(formData.ticketQuantity) }],
      images,
      tags: formData.tags.split(",").filter(Boolean)
    };
    createEventMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid lg:grid-cols-12 gap-12">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
                    Create <span className="text-purple-600">Event</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed">
                    Broadcast your next experience to the global network. 
                    Start by defining your mission parameters.
                  </p>
                </div>

                <div className="space-y-4">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                        step.completed 
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-110" 
                          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400"
                      }`}>
                        <step.icon size={20} />
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${step.completed ? 'text-purple-600' : 'text-slate-400'}`}>Step 0{i+1}</p>
                        <h3 className={`font-black tracking-tight ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{step.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>

                <TiltCard damping={15}>
                  <div className="p-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                     <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-white/10 group-hover:scale-125 transition-transform duration-700" />
                     <h3 className="text-xl font-black mb-4 relative z-10">Pro Tip</h3>
                     <p className="text-sm font-bold text-white/80 leading-relaxed relative z-10">
                        High-quality assets increase event engagement by up to 85%. Ensure your visual identity is crystal clear.
                     </p>
                  </div>
                </TiltCard>
              </motion.div>
            </div>

            {/* Main Form */}
            <div className="lg:col-span-8">
              <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-10"
              >
                {/* Section 1: Core */}
                <Section title="Basic Information" Icon={FileText}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField 
                      label="Event Horizon (Title)" 
                      value={formData.title} 
                      onChange={(v: string) => setFormData({...formData, title: v})} 
                      placeholder="e.g. Neon Nights 2026"
                      error={errors.title}
                    />
                    <CategorySelect 
                      value={formData.category} 
                      onChange={(v: string) => setFormData({...formData, category: v})} 
                      error={errors.category}
                    />
                  </div>
                  <div className="relative group">
                    <textarea
                      placeholder="Transmission details (Description)..."
                      className="w-full min-h-[160px] p-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/40 dark:border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white font-bold transition-all resize-none"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </Section>

                {/* Section 2: Time & Location */}
                <Section title="Timeline & Coordinates" Icon={Calendar}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <InputField label="Start Cycle" type="date" value={formData.startDate} onChange={(v: string) => setFormData({...formData, startDate: v})} />
                    <InputField label="End Cycle" type="date" value={formData.endDate} onChange={(v: string) => setFormData({...formData, endDate: v})} />
                    <InputField label="H-Hour" type="time" value={formData.startTime} onChange={(v: string) => setFormData({...formData, startTime: v})} />
                    <InputField label="Stand-down" type="time" value={formData.endTime} onChange={(v: string) => setFormData({...formData, endTime: v})} />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 pt-4">
                    <InputField label="Operational Base (Venue)" value={formData.venueName} onChange={(v: string) => setFormData({...formData, venueName: v})} placeholder="Venue Name" />
                    <InputField label="City Protocol" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} placeholder="Global City" />
                  </div>
                </Section>

                {/* Section 3: Economy */}
                <Section title="Economic Framework" Icon={DollarSign}>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative group">
                      <select 
                        value={formData.ticketType} 
                        onChange={e => setFormData({...formData, ticketType: e.target.value as any})}
                        className="w-full h-14 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/40 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white font-bold appearance-none cursor-pointer"
                      >
                         <option value="regular">Regular</option>
                         <option value="vip">VIP</option>
                         <option value="premium">Premium</option>
                      </select>
                    </div>
                    <InputField label="Credit Cost (INR)" type="number" value={formData.ticketPrice} onChange={(v: string) => setFormData({...formData, ticketPrice: v})} placeholder="0.00" />
                    <InputField label="Operational Capacity" type="number" value={formData.ticketQuantity} onChange={(v: string) => setFormData({...formData, ticketQuantity: v})} placeholder="Total Seats" />
                  </div>
                </Section>

                {/* Section 4: Visuals */}
                <Section title="Identity Assets" Icon={Tag}>
                   <div className="bg-white/30 dark:bg-slate-900/30 p-8 rounded-[2rem] border border-white/20 dark:border-slate-800/30">
                     <ImageUpload onImagesChange={setImages} maxImages={3} existingImages={images} />
                   </div>
                </Section>

                {/* Submit Hub */}
                <div className="pt-10 flex flex-col items-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={createEventMutation.isPending}
                    type="submit"
                    className="w-full h-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-4 group transition-all"
                  >
                    {createEventMutation.isPending ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    ) : (
                      <>
                        Transmit Blueprint
                        <Send className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                      </>
                    )}
                  </motion.button>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Secure Transmission v3.4.1</p>
                </div>

              </motion.form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Section = ({ title, children, Icon }: any) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4 mb-2">
      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
        <Icon size={20} />
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, placeholder, error }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 group-focus-within:text-purple-600 transition-colors">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-14 px-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-white/40 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white font-bold transition-all ${
          error ? 'border-red-500/50 ring-2 ring-red-500/10' : ''
        }`}
      />
      {error && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest mt-2 ml-4">{error}</p>}
    </div>
  </div>
);

const SlidersHorizontal = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 4h-7M10 4H3M21 12H12M8 12H3M21 20H16M12 20H3M14 2v4M8 10v4M16 18v4"/>
  </svg>
);

export default CreateEventPage;