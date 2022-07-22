import React from "react"
import Button from "../../../../components/fundamentals/button"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"

export const PaymentActionables = ({
  order,
  capturePayment,
  showRefundMenu,
}) => {
  const notification = useNotification()
  const isSystemPayment = order?.payments?.some(
    (p) => p.provider_id === "system"
  )
  const { t } = useTranslation()
  const { payment_status } = order!

  // Default label and action
  let label = "Capture payment"
  let action = () => {
    capturePayment.mutate(void {}, {
      onSuccess: () =>
        notification(
          t("common.status.success"),
          t("orders.notification.capture_payment_success"),
          "success"
        ),
      onError: (err) =>
        notification(t("common.status.error"), getErrorMessage(err), "error"),
    })
  }
  const loading = capturePayment.isLoading

  let shouldShowNotice = false
  // If payment is a system payment, we want to show a notice
  if (payment_status === "awaiting" && isSystemPayment) {
    shouldShowNotice = true
  }

  if (payment_status === "requires_action" && isSystemPayment) {
    shouldShowNotice = true
  }

  switch (true) {
    case payment_status === "captured" ||
      payment_status === "partially_refunded": {
      label = t("orders.actions.replace")
      action = () => showRefundMenu()
      break
    }

    case shouldShowNotice: {
      action = () =>
        console.log(
          "TODO: Show alert indicating, that you are capturing a system payment"
        )
      break
    }

    case payment_status === "requires_action": {
      return null
    }
    default:
      break
  }

  return (
    <Button
      variant="secondary"
      size="small"
      onClick={action}
      loading={loading}
      className="min-w-[130px]"
    >
      {label}
    </Button>
  )
}
