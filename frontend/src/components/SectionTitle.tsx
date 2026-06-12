type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

const SectionTitle = ({ eyebrow, title, description, align = "center" }: SectionTitleProps) => {
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div className={`space-y-3 ${alignment}`}>
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.3em] text-rose-400 font-semibold">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">{title}</h2>
      {description && <p className="text-slate-600 max-w-2xl mx-auto">{description}</p>}
    </div>
  );
};

export default SectionTitle;
