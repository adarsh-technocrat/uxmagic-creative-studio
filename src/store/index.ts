import { configureStore } from "@reduxjs/toolkit";
import studioReducer from "./studioSlice";
import workspacesReducer from "./workspacesSlice";
import brandsReducer from "./brandsSlice";

export const store = configureStore({
  reducer: {
    studio: studioReducer,
    workspaces: workspacesReducer,
    brands: brandsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
