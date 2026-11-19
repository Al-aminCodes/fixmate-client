"use client";

import { X } from "lucide-react";
import type { FormEvent, ChangeEvent } from "react";
import type { ServiceFormValues } from "@/types/service";
import ServiceForm from "./service-form";

type Props = {
  open: boolean;
  values: ServiceFormValues;
  imagePreview: string;
  saving: boolean;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function EditServiceDialog({
  open,
  values,
  imagePreview,
  saving,
  onChange,
  onImageChange,
  onSubmit,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4">
      <div className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background p-5">
          <div>
            <h2 className="text-xl font-bold">Edit Service</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your updated service will require admin approval.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
            className="rounded-lg p-2 hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>

        <ServiceForm
          values={values}
          imagePreview={imagePreview}
          saving={saving}
          onChange={onChange}
          onImageChange={onImageChange}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
