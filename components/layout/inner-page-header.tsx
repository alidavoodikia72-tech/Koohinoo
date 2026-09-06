type InnerPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function InnerPageHeader({
  eyebrow,
  title,
  description,
}: InnerPageHeaderProps) {
  return (
    <header className="space-y-3">
      {eyebrow ? (
        <p className="text-sm font-medium text-cyan-300">{eyebrow}</p>
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">
          {title}
        </h1>

        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
