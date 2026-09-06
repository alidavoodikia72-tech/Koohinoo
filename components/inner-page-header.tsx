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
    <section className="mx-auto max-w-6xl px-6 pt-12">
      {eyebrow ? (
        <p className="text-sm tracking-[0.2em] text-cyan-400">{eyebrow}</p>
      ) : null}

      <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{title}</h1>

      {description ? (
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
          {description}
        </p>
      ) : null}
    </section>
  );
}
