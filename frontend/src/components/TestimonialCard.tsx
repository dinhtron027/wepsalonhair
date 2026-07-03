import { motion } from "framer-motion";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const TestimonialCard = ({ quote, name, role, avatar }: TestimonialCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="rounded-3xl border border-rose-100 bg-white/80 p-6 shadow-[0_20px_60px_-40px_rgba(244,63,94,0.5)] backdrop-blur-lg"
    >
      <p className="text-slate-700 leading-relaxed">“{quote}”</p>
      <div className="mt-4 flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
        />
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-rose-500">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
