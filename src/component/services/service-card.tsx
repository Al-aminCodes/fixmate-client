import { Clock, MapPin, Pencil, Trash2 } from "lucide-react";

import type { Service } from "@/types/service";
import ServiceStatusBadge from "./service-status-badge";

type Props = {
  service: Service;
  deleting: boolean;
  toggling: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onToggleAvailability: (service: Service) => void;
};

export default function ServiceCard({
  service,
  deleting,
  toggling,
  onEdit,
  onDelete,
  onToggleAvailability,
}: Props) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="relative h-48 bg-muted">
        <img
          src={service.image}
          alt={service.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute left-3 top-3">
          <ServiceStatusBadge status={service.approvalStatus} />
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <p className="text-sm text-primary">{service.category}</p>
          <h2 className="mt-1 text-lg font-bold">{service.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {service.description}
          </p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <MapPin size={16} />
            {service.serviceArea}
          </p>
          <p className="flex items-center gap-2">
            <Clock size={16} />
            {service.estimatedDuration}
          </p>
          <p>{service.serviceMode}</p>
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Starting price</p>
            <p className="text-xl font-bold text-primary">
              ৳{Number(service.basePrice).toLocaleString("en-BD")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {service.isAvailable ? "Available" : "Unavailable"}
            </span>

            <button
              type="button"
              disabled={toggling}
              onClick={() => onToggleAvailability(service)}
              aria-label="Toggle availability"
              aria-pressed={service.isAvailable}
              className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${
                service.isAvailable ? "bg-green-600" : "bg-muted-foreground/40"
              }`}
            >
              <span
                className={`absolute top-1 size-4 rounded-full bg-white transition ${
                  service.isAvailable ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <button
            type="button"
            onClick={() => onEdit(service)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border text-sm font-semibold hover:bg-muted"
          >
            <Pencil size={16} />
            Edit
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() => onDelete(service)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-destructive/10 text-sm font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}
