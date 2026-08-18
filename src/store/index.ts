import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import jobsReducer from "./jobsSlice";

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      jobs: jobsReducer,
    },
    middleware: (getDefault) =>
      getDefault({
        serializableCheck: false,
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
