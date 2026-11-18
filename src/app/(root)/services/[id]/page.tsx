import { notFound } from "next/navigation";
import Image from "next/image";
import ServiceDetails from "@/components/services/service-details";
import type { Service } from "@/types/service";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const getServiceDetails = async (id: string): Promise<Service | null> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${baseUrl}/services/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch service details");
  }

  const result = await response.json();

  return result.data;
};

const ServiceDetailsPage = async ({ params }: Props) => {
  const { id } = await params;

  let service: Service | null;

  try {
    service = await getServiceDetails(id);
  } catch {
    throw new Error("Unable to load service details");
  }

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ServiceDetails service={service} />
      </div>
    </main>
  );
};

export default ServiceDetailsPage;
