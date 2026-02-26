import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  getAllEvents,
  getEventById,
  type Event,
} from "../../services/eventService";

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface EventState {
  currentEvent: Event | null;
  events: Event[];
  currentStatus: AsyncStatus;
  listStatus: AsyncStatus;
  error: string | null;
}

const initialState: EventState = {
  currentEvent: null,
  events: [],
  currentStatus: "idle",
  listStatus: "idle",
  error: null,
};

function unwrapEventResponse(payload: unknown): Event {
  // Supports API shapes like: { success: true, data: Event } or direct Event.
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Event }).data;
  }
  return payload as Event;
}

function unwrapEventsResponse(payload: unknown): Event[] {
  // Supports API shapes like: { success: true, data: Event[] } or direct Event[].
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: Event[] }).data;
  }
  return payload as Event[];
}

export const fetchEventById = createAsyncThunk<Event, string>(
  "event/fetchById",
  async (eventId, thunkApi) => {
    try {
      const res = await getEventById(eventId);
      return unwrapEventResponse(res);
    } catch (err: any) {
      return thunkApi.rejectWithValue(
        err?.response?.data?.message || err?.message || "Failed to fetch event"
      );
    }
  }
);

export const fetchEvents = createAsyncThunk<
  Event[],
  Parameters<typeof getAllEvents>[0] | undefined
>("event/fetchList", async (params, thunkApi) => {
  try {
    const res = await getAllEvents(params);
    return unwrapEventsResponse(res);
  } catch (err: any) {
    return thunkApi.rejectWithValue(
      err?.response?.data?.message || err?.message || "Failed to fetch events"
    );
  }
});

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    setCurrentEvent: (state, action: PayloadAction<Event | null>) => {
      state.currentEvent = action.payload;
      state.currentStatus = action.payload ? "succeeded" : "idle";
      state.error = null;
    },
    clearEventError: (state) => {
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
      state.currentStatus = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.currentStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.currentStatus = "succeeded";
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.currentStatus = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch event";
      })
      .addCase(fetchEvents.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch events";
      });
  },
});

export const { setCurrentEvent, clearEventError, clearCurrentEvent } =
  eventSlice.actions;

// Selectors (kept simple like your auth slice)
export const selectCurrentEvent = (state: { event: EventState }) =>
  state.event.currentEvent;
export const selectEventStatus = (state: { event: EventState }) =>
  state.event.currentStatus;
export const selectEventList = (state: { event: EventState }) =>
  state.event.events;
export const selectEventListStatus = (state: { event: EventState }) =>
  state.event.listStatus;
export const selectEventError = (state: { event: EventState }) => state.event.error;

export default eventSlice.reducer;

