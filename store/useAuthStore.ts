import { create } from "zustand";
import { authService, tokenStorage } from "@/services/authService";

interface SignUpState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  errors: {
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  validateStep1: () => boolean;
  validate: () => boolean;
  signup: () => Promise<boolean>;
  login: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    role?: string;
  } | null;
  initAuth: () => void;
}

export const useAuthStore = create<SignUpState>((set, get) => ({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  errors: {},
  isLoading: false,
  error: null,
  token: null,
  isAuthenticated: false,
  user: null,

  initAuth: () => {
    const token = tokenStorage.getToken();
    if (token) {
      // In a real app we might validate the token or fetch the user here
      // For now we just set auth to true.
      // Ideally we should persist the user object too or fetch it.
      // Let's assume for now we don't have the user obj on init unless we fetch it.
      set({ token, isAuthenticated: true });
    }
  },

  setFullName: (name) =>
    set({ fullName: name, errors: { ...get().errors, fullName: undefined } }),
  setEmail: (email) =>
    set({ email, errors: { ...get().errors, email: undefined } }),
  setPassword: (password) =>
    set({ password, errors: { ...get().errors, password: undefined } }),
  setConfirmPassword: (password) =>
    set({
      confirmPassword: password,
      errors: { ...get().errors, confirmPassword: undefined },
    }),
  validateStep1: () => {
    const { fullName, email } = get();
    const errors: SignUpState["errors"] = { ...get().errors };
    let isValid = true;

    // Clear step 1 errors first
    delete errors.fullName;
    delete errors.email;

    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "Email Address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    set({ errors });
    return isValid;
  },
  validate: () => {
    const { fullName, email, password, confirmPassword } = get();
    const errors: SignUpState["errors"] = {};
    let isValid = true;

    if (!fullName.trim()) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!email.trim()) {
      errors.email = "Email Address is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email address";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    set({ errors });
    return isValid;
  },
  signup: async () => {
    const { fullName, email, password } = get();
    set({ isLoading: true, error: null });

    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ") || ""; // Handle cases with no last name or multiple middle names

      const result = await authService.register({
        email,
        firstName,
        lastName,
        password,
      });

      set({
        isLoading: false,
        token: result.accessToken,
        isAuthenticated: true,
        user: result.loggedInUser || null,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Registration failed",
      });
      return false;
    }
  },
  login: async () => {
    const { email, password } = get();
    set({ isLoading: true, error: null });

    try {
      const result = await authService.login({
        email,
        password,
      });

      set({
        isLoading: false,
        token: result.accessToken,
        isAuthenticated: true,
        user: result.loggedInUser || null,
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Login failed",
      });
      return false;
    }
  },

  logout: () => {
    authService.logout();
    set({
      token: null,
      isAuthenticated: false,
      user: null,
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
      errors: {},
    });
  },
}));
