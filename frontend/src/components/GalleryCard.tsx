import { motion } from "framer-motion";

type GalleryCardProps = {
  src: string;
  alt: string;
  label?: string;
};

const GalleryCard = ({ src, alt, label }: GalleryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      viewport={{ once: true, margin: "-80px" }}
      className="relative overflow-hidden rounded-3xl bg-white/60 shadow-lg shadow-rose-100"
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-110"
        loading="lazy"
      />
      {label && (
        <span className="absolute left-3 bottom-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-rose-500 shadow">
          {label}
        </span>
      )}
    </motion.div>
  );
};

export default GalleryCard;
