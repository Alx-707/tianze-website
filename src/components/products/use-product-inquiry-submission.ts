"use client";

import { useActionState, useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  API_ERROR_NAMESPACE,
  translateApiError,
} from "@/lib/api/translate-error-code";
import { isPartialSuccessErrorCode } from "@/constants/api-error-codes";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { getAttributionAsObject } from "@/lib/utm";

interface FormState {
  success: boolean;
  partial?: boolean;
  error: string | undefined;
  referenceId?: string | undefined;
}

const initialState: FormState = {
  success: false,
  error: undefined,
};

interface SubmitInquiryData {
  fullName: string;
  email: string;
  company: string;
  quantity: string;
  targetPrice: string;
  requirements: string;
}

interface SubmitInquiryParams {
  data: SubmitInquiryData;
  productSlug: string;
  productName: string;
  token: string;
  idempotencyKey: string;
}

interface InquiryApiResponse {
  success?: boolean;
  errorCode?: string;
  data?: {
    partialSuccess?: boolean;
    referenceId?: string;
  };
}

interface InquirySubmissionHandlers {
  state: FormState;
  formAction: (formData: FormData) => void;
  isSubmitting: boolean;
  turnstileToken: string | null;
  handleTurnstileSuccess: (token: string) => void;
  handleTurnstileReset: () => void;
}

function extractFormData(formData: FormData): SubmitInquiryData {
  return {
    fullName: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    quantity: String(formData.get("quantity") ?? "").trim(),
    targetPrice: String(formData.get("targetPrice") ?? "").trim(),
    requirements: String(formData.get("requirements") ?? "").trim(),
  };
}

async function submitInquiry({
  data,
  productSlug,
  productName,
  token,
  idempotencyKey,
}: SubmitInquiryParams): Promise<{
  ok: boolean;
  partial: boolean;
  errorCode?: string;
  referenceId?: string;
}> {
  const attribution = getAttributionAsObject();
  const requestBody = {
    type: "product",
    fullName: data.fullName,
    email: data.email,
    productSlug,
    productName,
    quantity: data.quantity,
    turnstileToken: token,
    ...(data.company !== "" && { company: data.company }),
    ...(data.requirements !== "" && { requirements: data.requirements }),
    ...attribution,
  };

  const response = await fetch("/api/inquiry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(requestBody),
  });
  const result = (await response.json()) as InquiryApiResponse;
  const partial =
    result.errorCode !== undefined &&
    isPartialSuccessErrorCode(result.errorCode) &&
    result.data?.partialSuccess === true;
  return {
    ok: response.ok && result.success === true,
    partial,
    ...(result.errorCode !== undefined && { errorCode: result.errorCode }),
    ...(result.data?.referenceId !== undefined
      ? { referenceId: result.data.referenceId }
      : {}),
  };
}

export function useProductInquirySubmission({
  productName,
  productSlug,
  onSuccess,
}: {
  productName: string;
  productSlug: string;
  onSuccess: (() => void) | undefined;
}): InquirySubmissionHandlers {
  const t = useTranslations("products.inquiry");
  const tApi = useTranslations(API_ERROR_NAMESPACE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileTokenRef = useRef<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const handleTurnstileSuccess = useCallback((token: string) => {
    turnstileTokenRef.current = token;
    setTurnstileToken(token);
  }, []);

  const handleTurnstileReset = useCallback(() => {
    turnstileTokenRef.current = null;
    setTurnstileToken(null);
  }, []);

  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    setIsSubmitting(true);
    try {
      const token = turnstileTokenRef.current;
      if (!token) return { success: false, error: t("turnstileRequired") };
      const idempotencyKey =
        idempotencyKeyRef.current ?? generateIdempotencyKey();
      idempotencyKeyRef.current = idempotencyKey;

      const data = extractFormData(formData);
      const result = await submitInquiry({
        data,
        productSlug,
        productName,
        token,
        idempotencyKey,
      });
      if (result.partial) {
        return {
          success: false,
          partial: true,
          error: translateApiError(tApi, result.errorCode),
          referenceId: result.referenceId,
        };
      }
      if (!result.ok) {
        return {
          success: false,
          error: translateApiError(tApi, result.errorCode),
        };
      }

      idempotencyKeyRef.current = null;
      onSuccess?.();
      return { success: true, error: undefined };
    } catch {
      return { success: false, error: t("error") };
    } finally {
      setIsSubmitting(false);
    }
  }

  const [state, formAction] = useActionState(handleSubmit, initialState);

  return {
    state,
    formAction,
    isSubmitting,
    turnstileToken,
    handleTurnstileSuccess,
    handleTurnstileReset,
  };
}
