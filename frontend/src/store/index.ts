import { create } from "zustand";
import { stylists } from "../constant/data";
import { services as servicesData, Service } from "../features/services/serviceData";

type Booking = {
  name: string;
  phone: string;
  stylist: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
};

type SalonState = {
  services: Service[];
  stylists: typeof stylists;
  bookings: Booking[];
  addBooking: (booking: Booking) => void;
  filter: string;
  setFilter: (category: string) => void;
};

const useSalonStore = create<SalonState>((set) => ({
  services: servicesData,
  stylists,
  bookings: [],
  filter: "Tất cả",
  addBooking: (booking) =>
    set((state) => ({
      bookings: [...state.bookings, booking],
    })),
  setFilter: (category) => set(() => ({ filter: category })),
}));

export default useSalonStore;
