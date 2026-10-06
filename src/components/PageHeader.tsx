import type { ReactNode } from "react";
import BackButton from "@/components/BackButton";
import { cn } from "@/lib/utils";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** fallback route when there is no history to go back to */
  backTo?: string;
  right?: ReactNode;
  className?: string;
};

const PageHeader = ({ title, subtitle, backTo, right, className }: Props) => (
  <div className={cn("flex items-center gap-3", className)}>
    <BackButton to={backTo} />
    <div className="min-w-0 flex-1">
      <h1 className="text-balance text-[1.35rem] font-extrabold leading-tight text-foreground md:text-2xl">{title}</h1>
      {subtitle && <p className="mt-0.5 text-[15px] text-muted-foreground">{subtitle}</p>}
    </div>
    {right}
  </div>
);

export default PageHeader;
