export type ServiceCategory =
  | "Smartphone"
  | "Laptop & PC"
  | "AC"
  | "Refrigerator"
  | "TV"
  | "Washing Machine"
  | "Electrical";

export type ServiceMode = "Home Visit" | "Shop Drop-off";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Service = {
  _id: string;
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
  approvalStatus: ApprovalStatus;
  isAvailable: boolean;
  createdAt: string;
};

export type ServiceFormValues = {
  title: string;
  category: ServiceCategory | "";
  description: string;
  image: string;
  basePrice: string;
  estimatedDuration: string;
  serviceMode: ServiceMode;
  serviceArea: string;
};

export const serviceCategories: ServiceCategory[] = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

export const initialServiceForm: ServiceFormValues = {
  title: "",
  category: "",
  description: "",
  image: "",
  basePrice: "",
  estimatedDuration: "",
  serviceMode: "Home Visit",
  serviceArea: "",
};
