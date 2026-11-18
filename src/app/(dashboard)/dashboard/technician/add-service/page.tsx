"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Upload, ImagePlus, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

const serviceModes = ["Home Visit", "Shop Drop-off"];

export default function AddServicePage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");
  const [serviceMode, setServiceMode] = useState("");
  const [serviceArea, setServiceArea] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.imageUrl) {
      throw new Error(result.message || "Image upload failed.");
    }

    return result.imageUrl;
  };

  const resetForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setBasePrice("");
    setEstimatedDuration("");
    setServiceMode("");
    setServiceArea("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      toast.error("Please sign in first.");
      return;
    }

    if (user.role !== "technician") {
      toast.error("Only technicians can add services.");
      return;
    }

    if (!imageFile) {
      toast.error("Please upload a service image.");
      return;
    }

    const price = Number(basePrice);

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Base price must be a positive number.");
      return;
    }

    try {
      setIsSubmitting(true);

      // First upload the image to ImgBB
      const image = await uploadImage(imageFile);

      // Then save the service in MongoDB through Express
      const serviceData = {
        title: title.trim(),
        category,
        description: description.trim(),
        image,
        basePrice: price,
        estimatedDuration: estimatedDuration.trim(),
        serviceMode,
        serviceArea: serviceArea.trim(),
        technicianName: user.name,
        technicianEmail: user.email,
        approvalStatus: "pending",
        isAvailable: true,
      };

      const response = await fetch(`${API_URL}/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serviceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add service.");
      }

      toast.success("Service added! Waiting for admin approval.");
      resetForm();
    } catch (error) {
      console.error("Add service error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "technician") {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <h2 className="text-lg font-semibold">Access denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Only logged-in technicians can add a service.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

  const labelClass = "mb-2 block text-sm font-medium";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your repair service and make it available to customers after admin
          approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service information */}
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Service Information</h2>
            <p className="text-sm text-muted-foreground">
              Provide the basic details of your repair service.
            </p>
          </div>

          <div>
            <label htmlFor="title" className={labelClass}>
              Service Title *
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. iPhone Screen Replacement"
              className={inputClass}
              required
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="category" className={labelClass}>
              Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select a category</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what this service includes..."
              className={`${inputClass} min-h-32 resize-y`}
              required
              maxLength={2000}
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/2000
            </p>
          </div>

          {/* Image upload */}
          <div>
            <label className={labelClass}>Service Image *</label>

            {imagePreview ? (
              <div className="relative overflow-hidden rounded-xl border">
                <img
                  src={imagePreview}
                  alt="Service preview"
                  className="h-56 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white hover:bg-black"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="service-image"
                className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-4 py-8 text-center transition hover:border-primary hover:bg-primary/5"
              >
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <span className="text-sm font-semibold">
                  Click to upload service image
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  JPG, PNG or WEBP (maximum 5MB)
                </span>
              </label>
            )}

            <input
              id="service-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </section>

        {/* Pricing and availability */}
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Pricing & Availability</h2>
            <p className="text-sm text-muted-foreground">
              Set your starting price and service details.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="basePrice" className={labelClass}>
                Base Price (USD) *
              </label>
              <input
                id="basePrice"
                type="number"
                min="0.01"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="e.g. 25"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label htmlFor="duration" className={labelClass}>
                Estimated Duration *
              </label>
              <input
                id="duration"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="e.g. 2-3 hours or 1 day"
                className={inputClass}
                required
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="serviceMode" className={labelClass}>
                Service Mode *
              </label>
              <select
                id="serviceMode"
                value={serviceMode}
                onChange={(e) => setServiceMode(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">Select service mode</option>
                {serviceModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="serviceArea" className={labelClass}>
                Service Area *
              </label>
              <input
                id="serviceArea"
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="e.g. Dhanmondi, Dhaka"
                className={inputClass}
                required
                maxLength={100}
              />
            </div>
          </div>
        </section>

        {/* Technician details */}
        <section className="space-y-5 rounded-xl border bg-card p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Technician Information</h2>
            <p className="text-sm text-muted-foreground">
              These details come from your account.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Technician Name</label>
              <input
                value={user.name || ""}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-muted text-muted-foreground`}
              />
            </div>

            <div>
              <label className={labelClass}>Technician Email</label>
              <input
                value={user.email || ""}
                readOnly
                className={`${inputClass} cursor-not-allowed bg-muted text-muted-foreground`}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Service
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
