import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 ring-white/50 transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        checked ? "bg-ink" : "bg-white/50",
        disabled && "cursor-not-allowed opacity-45"
      )}
    >
      <span
        className={cn(
          "inline-block size-[18px] rounded-full bg-white shadow-sm transition-transform duration-200",
          "translate-x-[4px]",
          checked && "-translate-x-[22px]"
        )}
      />
    </button>
  );
}