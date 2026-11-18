export type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

export interface ICreateServicePayload {
  title: string;
  category: ServiceCategory;
  description: string;
  image: string;
  basePrice: number;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
  technicianName: string;
  technicianEmail: string;
  approvalStatus: "pending";
  isAvailable: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const AddService = async (serviceData: ICreateServicePayload) => {
  const response = await fetch(`${API_URL}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serviceData),
  });
  return response.json();
};
