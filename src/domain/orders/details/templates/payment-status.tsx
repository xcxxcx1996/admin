import React from "react"

import StatusDot from "../../../../components/fundamentals/status-indicator"
import { useTranslation } from "react-i18next"

export const PaymentStatusComponent = ({ status }) => {
  const { t } = useTranslation()
  switch (status) {
    case "captured":
      return <StatusDot title={t("orders.status.paid")} variant="success" />
    case "awaiting":
      return <StatusDot title={t("orders.status.awaiting")} variant="default" />
    case "canceled":
      return <StatusDot title={t("orders.status.canceled")} variant="danger" />
    case "requires_action":
      return (
        <StatusDot title={t("orders.status.request_action")} variant="danger" />
      )
    default:
      return null
  }
}
