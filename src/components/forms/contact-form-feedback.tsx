import { memo } from "react";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { type FormSubmissionStatus } from "@/lib/forms/form-submission-status";
import { translateApiError } from "@/lib/api/translate-error-code";
import { type ServerActionResult } from "@/lib/server-action-utils";
import { type ContactFormResult } from "@/lib/actions/contact";

/**
 * 获取状态消息配置
 */
export function getStatusConfig(
  status: FormSubmissionStatus,
  t: (key: string) => string,
): { className: string; message: string } | undefined {
  switch (status) {
    case "success":
      return {
        className: "bg-green-50 border-green-200 text-green-800",
        message: t("submitSuccess"),
      };
    case "error":
      return {
        className: "bg-red-50 border-red-200 text-red-800",
        message: t("submitError"),
      };
    case "submitting":
      return {
        className: "bg-blue-50 border-blue-200 text-blue-800",
        message: t("submitting"),
      };
    case "idle":
    default:
      return undefined;
  }
}

interface StatusMessageProps {
  status: FormSubmissionStatus;
  t: (key: string) => string;
}

export const StatusMessage = memo(({ status, t }: StatusMessageProps) => {
  if (status === "idle") return null;

  const config = getStatusConfig(status, t);
  if (!config) return null;
  const isError = status === "error";

  return (
    <div
      className={`rounded-md border p-4 ${config.className}`}
      data-testid="contact-form-status-message"
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      translate="no"
    >
      <span data-testid="contact-form-status-message-text" translate="no">
        {config.message}
      </span>
    </div>
  );
});

StatusMessage.displayName = "StatusMessage";

interface ErrorDisplayProps {
  state: ServerActionResult<ContactFormResult> | null;
  translateForm: (key: string) => string;
  translateApi: (key: string) => string;
  containerRef?: (_node: HTMLDivElement | null) => void;
}

export function ErrorDisplay({
  state,
  translateForm,
  translateApi,
  containerRef,
}: ErrorDisplayProps) {
  if (!state?.error && !state?.errorCode) return null;

  const translatedDetails = state.details?.map((detail) =>
    detail.startsWith("errors.") ? translateForm(detail) : detail,
  );
  const uniqueDetails = translatedDetails
    ? Array.from(new Set(translatedDetails))
    : undefined;
  const isValidationError =
    state.errorCode === API_ERROR_CODES.CONTACT_VALIDATION_FAILED;
  const translatedError = state.errorCode
    ? translateApiError(translateApi, state.errorCode)
    : undefined;
  const shouldShowTranslatedMessage = translatedError && !isValidationError;
  const shouldShowRawMessage =
    state.error && !state.errorCode && !isValidationError;

  return (
    <div
      ref={containerRef}
      className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
      data-testid="contact-form-error-display"
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      translate="no"
    >
      <p
        className="font-medium"
        data-testid="contact-form-error-heading"
        translate="no"
      >
        {translateForm("error")}
      </p>
      {shouldShowTranslatedMessage && (
        <p className="text-sm">{translatedError}</p>
      )}
      {shouldShowRawMessage && <p className="text-sm">{state.error}</p>}
      {uniqueDetails && uniqueDetails.length > 0 && (
        <ul className="mt-2 list-inside list-disc text-sm">
          {uniqueDetails.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
