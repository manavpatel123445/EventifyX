import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	profileImage?: string
}

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
    role?: string | null;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
}

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
    role: null,
	status: "idle",
	error: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		loginSuccess: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string; role: string  }>) => {
			state.user = action.payload.user;
            state.role = action.payload.role;
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
			state.status = "succeeded";
			state.error = null;
		},
		logout: (state) => {
			state.user = null;
			state.accessToken = null;
			state.refreshToken = null;
			state.status = "idle";
			state.error = null;
		},
		setUser: (state, action: PayloadAction<User>) => {
			state.user = action.payload;
		},
		setTokens: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
			state.accessToken = action.payload.accessToken;
			state.refreshToken = action.payload.refreshToken;
		},
        setRole: (state, action: PayloadAction<string>) => {
            state.role = action.payload;
        },
		setStatus: (state, action: PayloadAction<AuthState["status"]>) => {
			state.status = action.payload;
		},
		setError: (state, action: PayloadAction<string | null>) => {
			state.error = action.payload;
		},
	},
});

export const { loginSuccess, logout, setUser, setTokens, setStatus, setRole , setError } = authSlice.actions;
export default authSlice.reducer;
