type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

const SectionTitle = ({ eyebrow, title, description, align = "center" }: SectionTitleProps) => {
  const alignment = align === "center" ? "text-center" : "text-left font-sans";
  const descAlign = align === "center" ? "mx-auto" : "";
  return (
    <div className={`space-y-4 ${alignment}`}>
      {eyebrow && (
        <p className="text-[10px] uppercase tracking-[0.25em] text-taupe font-medium">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-display text-charcoal font-normal tracking-tight">{title}</h2>
      {description && <p className={`text-slate-500 text-sm max-w-2xl leading-relaxed ${descAlign}`}>{description}</p>}
    </div>
  );
};

export default SectionTitle;
