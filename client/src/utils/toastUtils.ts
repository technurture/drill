import { toast } from "sonner";

// Success toast functions
export const showSuccessToast = {
  loginSuccess: () => toast.success("Login successful!"),
  signupSuccess: () => toast.success("Account created successfully! Please check your email for verification link."),
  logoutSuccess: () => toast.success("Logged out successfully"),
  otpSent: () => toast.success("Verification email sent! Please check your inbox."),
  verificationSuccess: () => toast.success("Email verified successfully!"),
  storeCreated: () => toast.success("Store created successfully!"),
  profileUpdated: () => toast.success("Profile updated successfully!"),
  passwordChanged: () => toast.success("Password changed successfully!"),
  dataSaved: () => toast.success("Data saved successfully!"),
  syncComplete: () => toast.success("Data synchronized successfully!"),
  connectionRestored: () => toast.success("Connection restored! Syncing data..."),
};

// Error toast functions
export const showErrorToast = {
  loginFailed: (message?: string) => toast.error(message || "Login failed. Please try again."),
  signupFailed: (message?: string) => toast.error(message || "Sign up failed. Please try again."),
  invalidCredentials: () => toast.error("Invalid email or password. Please try again."),
  phoneNotVerified: () => toast.error("Please verify your phone number first."),
  emailNotVerified: () => toast.error("Please verify your email first."),
  accountNotFound: () => toast.error("No account found with this phone number. Please sign up first."),
  tooManyAttempts: () => toast.error("Too many login attempts. Please try again later."),
  networkError: () => toast.error("Network error. Please check your connection and try again."),
  serverError: () => toast.error("Server error. Please try again later."),
  otpInvalid: () => toast.error("Invalid OTP. Please try again."),
  otpExpired: () => toast.error("OTP has expired. Please request a new one."),
  phoneInvalid: () => toast.error("Please enter a valid phone number."),
  passwordTooShort: () => toast.error("Password must be at least 6 characters long."),
  userExists: () => toast.error("An account with this phone number already exists. Please try logging in instead."),
  syncFailed: () => toast.error("Failed to sync data. Please check your connection."),
  storeNotFound: () => toast.error("Store not found. Please contact support."),
  permissionDenied: () => toast.error("You don't have permission to perform this action."),
  unexpectedError: () => toast.error("An unexpected error occurred. Please try again."),
  offlineMode: () => toast.error("You're offline. Some features may be limited."),
  dataLoadFailed: () => toast.error("Failed to load data. Please refresh the page."),
};
