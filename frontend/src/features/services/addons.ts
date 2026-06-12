export type AddOn = {
  name: string;
  price: string;
  description: string;
};

export const addOns: AddOn[] = [
  { name: "Olaplex Bond Builder", price: "$35", description: "Protective bond treatment." },
  { name: "Gloss Toner", price: "$45", description: "Adds glass-like shine and tone refine." },
  { name: "Spa Shampoo Upgrade", price: "$25", description: "Aroma steam + scalp massage." },
];
