import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authslice";
import eventReducer from "./slices/eventslice";

const store = configureStore({
	reducer: {
		auth: authReducer,
		event: eventReducer,
        
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
