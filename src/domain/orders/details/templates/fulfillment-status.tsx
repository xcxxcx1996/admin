import React from "react"

import StatusDot from "../../../../components/fundamentals/status-indicator"

export const FulfillmentStatusComponent = ({ status }) => {
  switch (status) {
    case "shipped":
      return <StatusDot title="Shipped" variant="success" />
    case "fulfilled":
      return <StatusDot title="Fulfilled" variant="warning" />
    case "canceled":
      return <StatusDot title={t("orders.status.canceled")} variant="danger" />
    case "partially_fulfilled":
      return <StatusDot title="Partially fulfilled" variant="warning" />
    case "requires_action":
      return <StatusDot title="Requires Action" variant="danger" />
    default:
      return null
  }
}
