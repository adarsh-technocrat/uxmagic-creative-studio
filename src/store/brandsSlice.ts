import { createSlice } from "@reduxjs/toolkit";
import type { Brand } from "@/types/brand";

const initialBrands: Brand[] = [
  {
    id: "brand-1",
    name: "Brand Alpha",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    fontFamily: "system-ui, sans-serif",
    rules: "Use primary for headlines, secondary for accents.",
  },
];

const brandsSlice = createSlice({
  name: "brands",
  initialState: initialBrands,
  reducers: {
    addBrand(
      state,
      action: {
        payload: Omit<Brand, "id">;
      },
    ) {
      const id = `brand-${Date.now()}`;
      state.push({ ...action.payload, id });
    },
  },
});

export const { addBrand } = brandsSlice.actions;
export default brandsSlice.reducer;
