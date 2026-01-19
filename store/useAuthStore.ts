import { create } from "zustand";

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
}

export const useAuthStore = create<SignUpState>((set, get) => ({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  errors: {},
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
}));
