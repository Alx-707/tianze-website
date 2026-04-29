"use client";

import dynamic from "next/dynamic";
import { CheckCircle, Loader2, MessageSquare, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProductInquirySubmission } from "@/components/products/use-product-inquiry-submission";

// Lazy load Turnstile for performance
const TurnstileWidget = dynamic(
  () =>
    import("@/components/security/turnstile").then((m) => m.TurnstileWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-[65px] w-full animate-pulse rounded-md bg-muted"
        aria-hidden="true"
      />
    ),
  },
);

export interface ProductInquiryFormProps {
  /** Product name to display in the form */
  productName: string;
  /** Product slug for reference */
  productSlug: string;
  /** Custom class name */
  className?: string;
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
}

// Success message component
function SuccessMessage({ message }: { message: string }) {
  return (
    <CardContent
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="product-inquiry-success-message"
      role="status"
      aria-live="polite"
      translate="no"
    >
      <CheckCircle className="mb-4 h-12 w-12 text-green-500" />
      <p
        className="text-lg font-medium"
        data-testid="product-inquiry-success-text"
        translate="no"
      >
        {message}
      </p>
    </CardContent>
  );
}

// Form header component
interface FormHeaderProps {
  title: string;
  description: string;
}

function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <CardHeader className="bg-muted/50">
      <CardTitle className="flex items-center gap-2 text-lg">
        <MessageSquare className="h-5 w-5" />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

// Error display component
function ErrorMessage({ error }: { error: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600"
      data-testid="product-inquiry-error-message"
      role="alert"
      aria-live="assertive"
      translate="no"
    >
      <XCircle className="h-4 w-4" />
      <span data-testid="product-inquiry-error-text" translate="no">
        {error}
      </span>
    </div>
  );
}

function PartialMessage({ message }: { message: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-700"
      data-testid="product-inquiry-partial-message"
      role="status"
      aria-live="polite"
      translate="no"
    >
      <span data-testid="product-inquiry-partial-text" translate="no">
        {message}
      </span>
    </div>
  );
}

// Submit button component
interface SubmitButtonProps {
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
  disabled?: boolean;
}

function SubmitButton({
  isSubmitting,
  submitLabel,
  submittingLabel,
  disabled,
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      className="w-full"
      disabled={isSubmitting || disabled}
      data-testid="product-inquiry-submit-button"
      translate="no"
    >
      <span
        className="inline-flex min-w-[1.5rem] items-center justify-center"
        data-testid="product-inquiry-submit-icon"
        aria-hidden="true"
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
      </span>
      <span data-testid="product-inquiry-submit-label" translate="no">
        {isSubmitting ? submittingLabel : submitLabel}
      </span>
    </Button>
  );
}

// Product display component
function ProductDisplay({
  label,
  productName,
}: {
  label: string;
  productName: string;
}) {
  return (
    <div className="rounded-md bg-muted/50 p-3">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="font-medium">{productName}</p>
    </div>
  );
}

// Contact fields component
interface ContactFieldsProps {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
}

function ContactFields({
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
}: ContactFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="inquiry-name">{nameLabel} *</Label>
        <Input
          id="inquiry-name"
          name="name"
          required
          placeholder={namePlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-email">{emailLabel} *</Label>
        <Input
          id="inquiry-email"
          name="email"
          type="email"
          required
          placeholder={emailPlaceholder}
        />
      </div>
    </div>
  );
}

// Company field component
function CompanyField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="inquiry-company">{label}</Label>
      <Input id="inquiry-company" name="company" placeholder={placeholder} />
    </div>
  );
}

// Quantity and price fields component
interface QuantityPriceFieldsProps {
  quantityLabel: string;
  quantityPlaceholder: string;
  priceLabel: string;
  pricePlaceholder: string;
}

function QuantityPriceFields({
  quantityLabel,
  quantityPlaceholder,
  priceLabel,
  pricePlaceholder,
}: QuantityPriceFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="inquiry-quantity">{quantityLabel} *</Label>
        <Input
          id="inquiry-quantity"
          name="quantity"
          required
          placeholder={quantityPlaceholder}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inquiry-targetPrice">{priceLabel}</Label>
        <Input
          id="inquiry-targetPrice"
          name="targetPrice"
          placeholder={pricePlaceholder}
        />
      </div>
    </div>
  );
}

// Requirements field component
function RequirementsField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="inquiry-requirements">{label}</Label>
      <Textarea
        id="inquiry-requirements"
        name="requirements"
        rows={4}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * Product inquiry form for B2B product pages.
 */
export function ProductInquiryForm({
  productName,
  productSlug,
  className,
  onSuccess,
}: ProductInquiryFormProps) {
  const t = useTranslations("products.inquiry");
  const tContact = useTranslations("contact.form");
  const {
    state,
    formAction,
    isSubmitting,
    turnstileToken,
    handleTurnstileSuccess,
    handleTurnstileReset,
  } = useProductInquirySubmission({
    onSuccess,
    productName,
    productSlug,
  });

  if (state.success) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <SuccessMessage message={t("success")} />
      </Card>
    );
  }

  if (state.partial && state.error !== undefined) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <FormHeader title={t("title")} description={t("description")} />
        <CardContent className="pt-6">
          <PartialMessage message={state.error} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <FormHeader title={t("title")} description={t("description")} />
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="productSlug" value={productSlug} />
          <input type="hidden" name="productName" value={productName} />
          <ProductDisplay label={t("productName")} productName={productName} />
          <ContactFields
            nameLabel={tContact("firstName")}
            namePlaceholder={tContact("firstNamePlaceholder")}
            emailLabel={tContact("email")}
            emailPlaceholder={tContact("emailPlaceholder")}
          />
          <CompanyField
            label={tContact("company")}
            placeholder={tContact("companyPlaceholder")}
          />
          <QuantityPriceFields
            quantityLabel={t("quantity")}
            quantityPlaceholder={t("quantityPlaceholder")}
            priceLabel={t("targetPrice")}
            pricePlaceholder={t("targetPricePlaceholder")}
          />
          <RequirementsField
            label={t("requirements")}
            placeholder={t("requirementsPlaceholder")}
          />
          <TurnstileWidget
            onSuccess={handleTurnstileSuccess}
            onError={handleTurnstileReset}
            onExpire={handleTurnstileReset}
            action="product_inquiry"
            size="compact"
            theme="auto"
          />
          {state.error !== undefined && <ErrorMessage error={state.error} />}
          <SubmitButton
            isSubmitting={isSubmitting}
            submitLabel={t("submit")}
            submittingLabel={t("submitting")}
            disabled={!turnstileToken}
          />
        </form>
      </CardContent>
    </Card>
  );
}
