import { motion } from "framer-motion";

type Category = { id: string; name: string; tagline: string };

type CategoryFilterProps = {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
};

const CategoryFilter = ({ categories, active, onSelect }: CategoryFilterProps) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {categories.map((category) => {
        const isActive = active === category.id;
        return (
          <motion.button
            key={category.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(category.id)}
            className={`h-full rounded-2xl border bg-white/80 p-4 text-left shadow-md backdrop-blur-lg transition-all duration-200 ${
              isActive
                ? "border-rose-300 bg-rose-50 shadow-rose-200"
                : "border-rose-100 hover:border-rose-200 hover:shadow-rose-100"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-tight text-rose-500">
              {category.name}
            </p>
            <p className="mt-2 text-sm text-slate-600">{category.tagline}</p>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
