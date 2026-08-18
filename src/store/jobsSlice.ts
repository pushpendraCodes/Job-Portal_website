import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Job, JobCategory } from "@/lib/types";

interface JobsState {
  list: Job[];
  meta: { total: number; page: number; totalPages: number } | null;
  categories: JobCategory[];
  selected: Job | null;
  loading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  list: [],
  meta: null,
  categories: [],
  selected: null,
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    setJobsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setJobs(
      state,
      action: PayloadAction<{
        list: Job[];
        meta?: { total: number; page: number; totalPages: number };
      }>,
    ) {
      state.list = action.payload.list;
      state.meta = action.payload.meta ?? null;
      state.loading = false;
      state.error = null;
    },
    setJobSelected(state, action: PayloadAction<Job | null>) {
      state.selected = action.payload;
    },
    setCategories(state, action: PayloadAction<JobCategory[]>) {
      state.categories = action.payload;
    },
    setJobsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setJobsLoading, setJobs, setJobSelected, setCategories, setJobsError } =
  jobsSlice.actions;
export default jobsSlice.reducer;
