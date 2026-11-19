"use client";

import { useSession } from "@/lib/auth-client";
import { Loader2, Plus, Wrench } from "lucide-react";
import Link from "next/link";
import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Service, ServiceFormValues } from "@/types/service";
import { initialServiceForm } from "@/types/service";
import ServiceCard from "@/component/services/service-card";
import EditServiceDialog from "@/component/services/edit-service-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MyServicesPage() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const token = session?.session.token;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceFormValues>(initialServiceForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchServices = useCallback(async () => {
    if (!API_URL) {
      toast.error("API URL is not configured.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/technician/services`, {
        headers: {
          authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch services.");
      }

      setServices(data.services || []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not load services.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "technician") {
      void Promise.resolve().then(fetchServices);
    }
  }, [user?.role, fetchServices]);
  //   const loadServices = async () => {
  //     try {
  //       const response = await fetch(`${API_URL}/technician/services`, {
  //         headers: {
  //           authorization: `Bearer ${token}`,
  //         },
  //         credentials: "include",
  //       });

  //       if (!response.ok) {
  //         throw new Error("Failed to load services");
  //       }

  //       const data = await response.json();
  //       console.log(data);
  //       setServices(data);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  const handleEdit = (service: Service) => {
    setEditingService(service);

    setForm({
      title: service.title,
      category: service.category,
      description: service.description,
      image: service.image,
      basePrice: String(service.basePrice),
      estimatedDuration: service.estimatedDuration,
      serviceMode: service.serviceMode,
      serviceArea: service.serviceArea,
    });

    setImageFile(null);
    setImagePreview(service.image);
  };

  const closeDialog = () => {
    setEditingService(null);
    setForm(initialServiceForm);
    setImageFile(null);
    setImagePreview("");
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingService || !API_URL) return;

    const basePrice = Number(form.basePrice);

    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }

    if (!form.category) {
      toast.error("Select a service category.");
      return;
    }

    try {
      setSaving(true);

      let image = form.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Image upload failed.");
        }

        const uploadData = await uploadResponse.json();
        image = uploadData.imageUrl;
      }

      const updatedService = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        image,
        basePrice,
        estimatedDuration: form.estimatedDuration.trim(),
        serviceMode: form.serviceMode,
        serviceArea: form.serviceArea.trim(),
      };

      const response = await fetch(
        `${API_URL}/services/${editingService._id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedService),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update service.");
      }

      setServices((previous) =>
        previous.map((service) =>
          service._id === editingService._id
            ? {
                ...service,
                ...updatedService,
                approvalStatus: "pending",
              }
            : service,
        ),
      );

      toast.success("Service updated. Waiting for admin approval.");
      closeDialog();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!API_URL) return;

    if (!window.confirm(`Delete "${service.title}"?`)) return;

    try {
      setDeletingId(service._id);

      const response = await fetch(`${API_URL}/services/${service._id}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete service.");
      }

      setServices((previous) =>
        previous.filter((item) => item._id !== service._id),
      );

      toast.success("Service deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (service: Service) => {
    if (!API_URL) return;

    try {
      setTogglingId(service._id);

      const response = await fetch(
        `${API_URL}/services/${service._id}/availability`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isAvailable: !service.isAvailable }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update availability.");
      }

      setServices((previous) =>
        previous.map((item) =>
          item._id === service._id
            ? { ...item, isAvailable: !item.isAvailable }
            : item,
        ),
      );

      toast.success("Availability updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setTogglingId(null);
    }
  };

  if (isPending || (user?.role === "technician" && loading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={35} />
      </div>
    );
  }

  if (!user || user.role !== "technician") {
    return <p className="p-8 text-center">Access denied.</p>;
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">My Services</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your repair services.
          </p>
        </div>

        <Link
          href="/dashboard/technician/add-service"
          className="flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          <Plus size={18} />
          Add New Service
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          ["Total", services.length],
          [
            "Approved",
            services.filter((s) => s.approvalStatus === "approved").length,
          ],
          [
            "Pending",
            services.filter((s) => s.approvalStatus === "pending").length,
          ],
          [
            "Rejected",
            services.filter((s) => s.approvalStatus === "rejected").length,
          ],
        ].map(([label, count]) => (
          <div key={label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Wrench className="mx-auto text-muted-foreground" size={38} />
          <h2 className="mt-4 text-xl font-semibold">No Services Yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Add your first service to start receiving bookings.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              deleting={deletingId === service._id}
              toggling={togglingId === service._id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
          ))}
        </div>
      )}

      <EditServiceDialog
        open={Boolean(editingService)}
        values={form}
        imagePreview={imagePreview}
        saving={saving}
        onChange={handleChange}
        onImageChange={handleImageChange}
        onSubmit={handleUpdate}
        onClose={closeDialog}
      />
    </main>
  );
}
