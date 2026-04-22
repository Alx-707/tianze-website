"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { CheckCircle, Loader2, Mail, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  API_ERROR_NAMESPACE,
  translateApiError,
} from "@/lib/api/translate-error-code";
import { isPartialSuccessErrorCode } from "@/constants/api-error-codes";
import { cn } from "@/lib/utils";
import { getAttributionAsObject } from "@/lib/utm";
import { generateIdempotencyKey } from "@/lib/idempotency-key";
import { LazyTurnstile } from "@/components/forms/lazy-turnstile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export interface BlogNewsletterProps {
  /** Custom class name */
  className?: string;
  /** Variant style */
  variant?: "default" | "compact" | "inline";
}

interface FormState {
  success: boolean;
  partial?: boolean;
  error: string | undefined;
  referenceId?: string | undefined;
}

interface SubscribeApiResponse {
  success?: boolean;
  errorCode?: string;
  data?: {
    partialSuccess?: boolean;
    referenceId?: string;
  };
}

const initialState: FormState = {
  success: false,
  error: undefined,
};

interface NewsletterCommonProps {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  partial: boolean;
  successMessage: string;
  partialMessage: string | undefined;
  formProps: Parameters<typeof NewsletterForm>[0];
}

/**
 * Success message component
 */
function SuccessMessage({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 py-4 text-green-600"
      data-testid="blog-newsletter-success-message"
      role="status"
      aria-live="polite"
      translate="no"
    >
      <CheckCircle className="h-5 w-5 shrink-0" />
      <p
        className="text-sm font-medium"
        data-testid="blog-newsletter-success-text"
        translate="no"
      >
        {message}
      </p>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ error }: { error: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600"
      data-testid="blog-newsletter-error-message"
      role="alert"
      aria-live="assertive"
      translate="no"
    >
      <XCircle className="h-4 w-4 shrink-0" />
      <span data-testid="blog-newsletter-error-text" translate="no">
        {error}
      </span>
    </div>
  );
}

function PartialMessage({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-3 py-4 text-amber-700"
      data-testid="blog-newsletter-partial-message"
      role="status"
      aria-live="polite"
      translate="no"
    >
      <p
        className="text-sm font-medium"
        data-testid="blog-newsletter-partial-text"
        translate="no"
      >
        {message}
      </p>
    </div>
  );
}

/**
 * Newsletter form component
 */
function NewsletterForm({
  onSubmit,
  isSubmitting,
  error,
  placeholder,
  submitLabel,
  submittingLabel,
  variant,
  turnstileToken,
  onTurnstileSuccess,
  onTurnstileError,
  onTurnstileExpire,
}: {
  onSubmit: (formData: FormData) => void;
  isSubmitting: boolean;
  error: string | undefined;
  placeholder: string;
  submitLabel: string;
  submittingLabel: string;
  variant: "default" | "compact" | "inline";
  turnstileToken: string | null;
  onTurnstileSuccess: (token: string) => void;
  onTurnstileError: () => void;
  onTurnstileExpire: () => void;
}) {
  const isInline = variant === "inline";
  const isButtonDisabled = isSubmitting || !turnstileToken;

  return (
    <form action={onSubmit} className="space-y-3">
      <div className={cn(isInline && "flex gap-2")}>
        <Input
          type="email"
          name="email"
          required
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(isInline && "flex-1")}
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          disabled={isButtonDisabled}
          className={cn(!isInline && "w-full")}
          data-testid="blog-newsletter-submit-button"
          translate="no"
        >
          <span
            className="inline-flex min-w-[1.5rem] items-center justify-center"
            data-testid="blog-newsletter-submit-icon"
            aria-hidden="true"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
          </span>
          <span data-testid="blog-newsletter-submit-label" translate="no">
            {isSubmitting ? submittingLabel : submitLabel}
          </span>
        </Button>
      </div>
      <LazyTurnstile
        onSuccess={onTurnstileSuccess}
        onError={onTurnstileError}
        onExpire={onTurnstileExpire}
        action="newsletter_subscribe"
        size="compact"
        theme="auto"
      />
      {error !== undefined && <ErrorMessage error={error} />}
    </form>
  );
}

// Compact variant renderer
function CompactVariant({
  className,
  title,
  description,
  success,
  partial,
  successMessage,
  partialMessage,
  formProps,
}: {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  partial: boolean;
  successMessage: string;
  partialMessage: string | undefined;
  formProps: Parameters<typeof NewsletterForm>[0];
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {success ? (
        <SuccessMessage message={successMessage} />
      ) : partial && partialMessage !== undefined ? (
        <PartialMessage message={partialMessage} />
      ) : (
        <NewsletterForm {...formProps} />
      )}
    </div>
  );
}

// Inline variant renderer
function InlineVariant({
  className,
  title,
  description,
  success,
  partial,
  successMessage,
  partialMessage,
  formProps,
}: {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  partial: boolean;
  successMessage: string;
  partialMessage: string | undefined;
  formProps: Parameters<typeof NewsletterForm>[0];
}) {
  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="sm:w-80">
          {success ? (
            <SuccessMessage message={successMessage} />
          ) : partial && partialMessage !== undefined ? (
            <PartialMessage message={partialMessage} />
          ) : (
            <NewsletterForm {...formProps} />
          )}
        </div>
      </div>
    </div>
  );
}

function buildNewsletterCommonProps(args: {
  className: string | undefined;
  title: string;
  description: string;
  success: boolean;
  partial: boolean;
  successMessage: string;
  partialMessage: string | undefined;
  formProps: Parameters<typeof NewsletterForm>[0];
}): NewsletterCommonProps {
  return args;
}

function DefaultVariant({
  className,
  title,
  description,
  success,
  partial,
  successMessage,
  partialMessage,
  formProps,
}: NewsletterCommonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-muted/50">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {success ? (
          <SuccessMessage message={successMessage} />
        ) : partial && partialMessage !== undefined ? (
          <PartialMessage message={partialMessage} />
        ) : (
          <NewsletterForm {...formProps} />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Blog Newsletter Component - subscription form for blog email notifications.
 */
export function BlogNewsletter({
  className,
  variant = "default",
}: BlogNewsletterProps) {
  const t = useTranslations("blog.newsletter");
  const tApi = useTranslations(API_ERROR_NAMESPACE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const handleTurnstileSuccess = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    setIsSubmitting(true);
    try {
      const email = String(formData.get("email") ?? "").trim();
      const token = turnstileTokenRef.current;
      if (!token) return { success: false, error: t("turnstileRequired") };

      const idempotencyKey =
        idempotencyKeyRef.current ?? generateIdempotencyKey();
      idempotencyKeyRef.current = idempotencyKey;

      const attribution = getAttributionAsObject();
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        // nosemgrep: object-injection-sink-spread-operator
        // Safe: attribution is from getAttributionAsObject() which returns sanitized alphanumeric values
        body: JSON.stringify({
          email,
          pageType: "blog",
          turnstileToken: token,
          ...attribution,
        }),
      });
      const result = (await response.json()) as SubscribeApiResponse;
      const isPartial =
        result.errorCode !== undefined &&
        isPartialSuccessErrorCode(result.errorCode) &&
        result.data?.partialSuccess === true;
      if (isPartial) {
        return {
          success: false,
          partial: true,
          error: translateApiError(tApi, result.errorCode),
          referenceId: result.data?.referenceId,
        };
      }
      if (!response.ok || result.success !== true) {
        return {
          success: false,
          error: translateApiError(tApi, result.errorCode),
        };
      }
      idempotencyKeyRef.current = null;
      return { success: true, error: undefined };
    } catch {
      return { success: false, error: t("error") };
    } finally {
      setIsSubmitting(false);
    }
  }

  const [state, formAction] = useActionState(handleSubmit, initialState);

  const formProps = {
    onSubmit: formAction,
    isSubmitting,
    error: state.error,
    placeholder: t("placeholder"),
    submitLabel: t("submit"),
    submittingLabel: t("submitting"),
    variant,
    turnstileToken,
    onTurnstileSuccess: handleTurnstileSuccess,
    onTurnstileError: handleTurnstileError,
    onTurnstileExpire: handleTurnstileExpire,
  };

  const commonProps = buildNewsletterCommonProps({
    className,
    title: t("title"),
    description: t("description"),
    success: state.success,
    partial: state.partial === true,
    successMessage: t("success"),
    partialMessage: state.error,
    formProps,
  });

  if (variant === "compact") return <CompactVariant {...commonProps} />;
  if (variant === "inline") return <InlineVariant {...commonProps} />;

  return <DefaultVariant {...commonProps} />;
}
