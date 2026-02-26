import store from "./store";
import { setTokens, setUser, updateRole } from "./slices/authslice";

export function bootstrapAuth(): void {
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      store.dispatch(setTokens({ accessToken, refreshToken }));
    }
    if (userStr) {
      const user = JSON.parse(userStr);
      store.dispatch(setUser(user));
      if (user?.role) store.dispatch(updateRole(user.role));
    }
  } catch {
    // no-op
  }
}


