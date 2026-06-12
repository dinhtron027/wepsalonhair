import { useState } from "react";
import { motion } from "framer-motion";

type CompareSliderProps = {
  before: string;
  after: string;
  alt?: string;
};

const CompareSlider = ({ before, after, alt = "Before After" }: CompareSliderProps) => {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-rose-100 bg-white/50 shadow-lg shadow-rose-100">
      <div className="relative h-full min-h-[280px]">
        <img src={after} alt={`${alt} after`} className="h-full w-full object-cover" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img src={before} alt={`${alt} before`} className="h-full w-full object-cover" />
        </div>
        <motion.div
          className="absolute inset-y-0"
          style={{ left: `${position}%` }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragMomentum={false}
          onDrag={(e, info) => {
            const parent = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
            if (!parent) return;
            const next = ((info.point.x - parent.left) / parent.width) * 100;
            setPosition(Math.min(100, Math.max(0, next)));
          }}
        >
          <div className="absolute -left-[1px] top-0 h-full w-[3px] bg-rose-500 shadow-lg" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-rose-500 shadow">
            Kéo
          </div>
        </motion.div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        className="mt-3 w-full accent-rose-500"
      />
      <div className="flex justify-between px-4 pb-4 text-xs font-semibold text-slate-700">
        <span>Trước</span>
        <span>Sau</span>
      </div>
    </div>
  );
};

export default CompareSlider;
