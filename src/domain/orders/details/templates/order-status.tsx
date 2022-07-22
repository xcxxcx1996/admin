import React from "react"

import StatusDot from "../../../../components/fundamentals/status-indicator"
import { useTranslation } from "react-i18next"

export const OrderStatusComponent = ({ status }) => {
  const { t } = useTranslation()
  switch (status) {
    case "completed":
      return (
        <StatusDot title={t("orders.status.completed")} variant="success" />
      )
    case "pending":
      return <StatusDot title={t("orders.status.processing")} variant="default" />
    case "canceled":
      return <StatusDot title={t("orders.status.canceled")} variant="danger" />
    case "requires_action":
      return <StatusDot title={t("orders.status.request_action")} variant="danger" />
    default:
      return null
  }
}
