interface BadgeProps {
  status: "pending" | "done" | "rescheduled";
}

export default function Badge({ status }: BadgeProps) {
  const config = {
    pending: {
      label: "En attente",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    done: {
      label: "Termine",
      className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    },
    rescheduled: {
      label: "Reprogramme",
      className: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    },
  };

  const { label, className } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {label}
    </span>
  );
}