import Image from "next/image";
import { Service } from "./service-type";
import RepairRequestForm from "./repair-request-form";
import { getUserByEmail } from "@/lib/api/user";

type Props = {
  service: Service;
};

const ServiceDetails = async ({ service }: Props) => {
  const technician = await getUserByEmail(service.technicianEmail);
  console.log(technician);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Service information */}
      <div className="space-y-7 lg:col-span-2">
        {/* Service image */}
        <div className="relative h-[300px] overflow-hidden rounded-2xl sm:h-[450px]">
          <Image
            src={service.image}
            alt={service.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
        </div>

        {/* Title and category */}
        <div>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {service.category}
          </span>

          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
            {service.title}
          </h1>

          <p className="mt-4 leading-7 text-muted-foreground">
            {service.description}
          </p>
        </div>

        {/* Service information */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Starting Price</p>
            <h3 className="mt-2 text-xl font-bold">৳{service.basePrice}</h3>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Estimated Duration</p>
            <h3 className="mt-2 text-lg font-semibold">
              {service.estimatedDuration}
            </h3>
          </div>

          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Service Mode</p>
            <h3 className="mt-2 text-lg font-semibold">
              {service.serviceMode}
            </h3>
          </div>

          <div className="col-span-2 rounded-xl border p-5 md:col-span-3">
            <p className="text-sm text-muted-foreground">Service Area</p>
            <h3 className="mt-2 font-semibold">{service.serviceArea}</h3>
          </div>
        </div>

        {/* Technician summary */}
        <div className="rounded-2xl border p-6">
          <h2 className="mb-5 text-xl font-bold">Your Technician</h2>

          {technician ? (
            <div className="flex flex-col gap-5 sm:flex-row">
              {technician.photo ? (
                <Image
                  src={technician.photo}
                  alt={technician.name}
                  width={100}
                  height={100}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-2xl font-bold">
                  {technician.name?.charAt(0)}
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold">{technician.name}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  {technician.area}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {technician.email}
                </p>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {technician.bio}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Technician profile information is currently unavailable.
            </p>
          )}
        </div>
      </div>

      {/* Repair request section */}
      <aside>
        <div className="sticky top-24 rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Starting from</p>

          <h2 className="mt-2 text-3xl font-bold">৳{service.basePrice}</h2>

          <div className="my-5 border-t" />

          <h3 className="text-xl font-semibold">Need this service?</h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Submit a repair request and our technician will assist you.
          </p>

          <div className="mt-6">
            <RepairRequestForm service={service} />
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ServiceDetails;
