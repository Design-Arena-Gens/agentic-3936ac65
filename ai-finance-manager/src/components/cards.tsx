import { ReactNode } from "react";

type CardProps = {
  title?: string;
  description?: string;
  className?: string;
  headerSlot?: ReactNode;
  children: ReactNode;
};

export function Card({
  title,
  description,
  className = "",
  headerSlot,
  children,
}: CardProps) {
  return (
    <section
      className={`rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {(title || description || headerSlot) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            )}
          </div>
          {headerSlot}
        </header>
      )}
      <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
        {children}
      </div>
    </section>
  );
}

