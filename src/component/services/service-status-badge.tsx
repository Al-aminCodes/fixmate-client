import type { ApprovalStatus } from "@/types/service";

type Props = {
  status: ApprovalStatus;
};

const statusStyles: Record<ApprovalStatus, string> = {
  approved: "bg-green-500/10 text-green-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  rejected: "bg-red-500/10 text-red-600",
};

export default function ServiceStatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
