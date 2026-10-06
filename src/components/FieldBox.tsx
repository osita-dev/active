import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
};

/** Label lives inside the border (as in the design); focus lights up the whole box. */
const FieldBox = ({ label, htmlFor, required, optional, children, className }: Props) => (
  <div
    className={cn(
      "group rounded-2xl border border-input bg-card px-4 pb-2 pt-2.5 transition duration-150 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/15",
      className,
    )}
  >
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-muted-foreground transition group-focus-within:text-primary">
      {label}
      {required && <span className="text-primary"> *</span>}
      {optional && <span className="font-normal"> (optional)</span>}
    </label>
    {children}
  </div>
);

export default FieldBox;
