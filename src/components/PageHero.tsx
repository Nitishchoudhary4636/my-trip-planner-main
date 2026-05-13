type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  image?: string;
  compact?: boolean;
};

export function PageHero({ eyebrow, title, subtitle, image, compact }: Props) {
  return (
    <section className={`relative overflow-hidden ${compact ? "py-14" : "py-20 md:py-28"}`}>
      {image && (
        <div className="absolute inset-0 -z-10">
          <img src={image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 gradient-hero" />
        </div>
      )}
      {!image && <div className="absolute inset-0 -z-10 gradient-sky" />}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {eyebrow && (
          <div className="mb-3 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur">
            {eyebrow}
          </div>
        )}
        <h1 className={`max-w-3xl font-display font-extrabold leading-[1.05] ${image ? "text-white" : "text-foreground"} ${compact ? "text-3xl md:text-4xl" : "text-4xl md:text-6xl"}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-4 max-w-2xl text-base md:text-lg ${image ? "text-white/85" : "text-muted-foreground"}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
