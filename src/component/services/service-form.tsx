"use client";

import type { ChangeEvent, FormEvent } from "react";
import { serviceCategories, type ServiceFormValues } from "@/types/service";

type Props = {
  values: ServiceFormValues;
  imagePreview: string;
  saving: boolean;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

export default function ServiceForm({
  values,
  imagePreview,
  saving,
  onChange,
  onImageChange,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 p-5">
      <div>
        <label className="mb-2 block text-sm font-medium">Service Image</label>

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Service preview"
            className="mb-3 h-44 w-full rounded-lg object-cover"
          />
        )}

        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={onImageChange}
          className="block w-full text-sm"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Service Title</label>
        <input
          name="title"
          value={values.title}
          onChange={onChange}
          required
          className="h-11 w-full rounded-lg border bg-background px-3"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Category</label>
        <select
          name="category"
          value={values.category}
          onChange={onChange}
          required
          className="h-11 w-full rounded-lg border bg-background px-3"
        >
          <option value="">Select category</option>
          {serviceCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={values.description}
          onChange={onChange}
          required
          rows={4}
          className="w-full rounded-lg border bg-background p-3"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Base Price (৳)
          </label>
          <input
            type="number"
            name="basePrice"
            min="1"
            value={values.basePrice}
            onChange={onChange}
            required
            className="h-11 w-full rounded-lg border bg-background px-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Estimated Duration
          </label>
          <input
            name="estimatedDuration"
            value={values.estimatedDuration}
            onChange={onChange}
            required
            placeholder="e.g. 2-3 hours"
            className="h-11 w-full rounded-lg border bg-background px-3"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Service Mode</label>
        <select
          name="serviceMode"
          value={values.serviceMode}
          onChange={onChange}
          className="h-11 w-full rounded-lg border bg-background px-3"
        >
          <option value="Home Visit">Home Visit</option>
          <option value="Shop Drop-off">Shop Drop-off</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Service Area</label>
        <input
          name="serviceArea"
          value={values.serviceArea}
          onChange={onChange}
          required
          className="h-11 w-full rounded-lg border bg-background px-3"
        />
      </div>

      <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-11 rounded-lg border px-5 text-sm font-semibold hover:bg-muted"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
