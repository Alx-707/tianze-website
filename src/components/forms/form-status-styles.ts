export const FORM_STATUS_CLASS_NAMES = {
  success:
    "border-[var(--success-border)] bg-[var(--success-muted)] text-[var(--success-foreground)]",
  error:
    "border-[var(--error-border)] bg-[var(--error-muted)] text-[var(--error-foreground)]",
  submitting:
    "border-[var(--info-border)] bg-[var(--info-muted)] text-[var(--info-foreground)]",
  partialSuccess:
    "border-[var(--warning-border)] bg-[var(--warning-muted)] text-[var(--warning-foreground)]",
  warningText: "text-[var(--warning-foreground)]",
} as const;

export const FORM_FIELD_REQUIRED_CLASS_NAME =
  "after:ml-0.5 after:text-destructive after:content-['*']";

export const LEGACY_FORM_STATUS_TEST_CLASS_NAMES = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  submitting: "border-blue-200 bg-blue-50 text-blue-800",
  partialSuccess: "border-amber-200 bg-amber-50 text-amber-800",
} as const;
