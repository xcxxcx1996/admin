import React from "react"
import StatusIndicator from "../../fundamentals/status-indicator"
import { useTranslation } from "react-i18next"

type PaymentStatusProps = {
  paymentStatus: string
}

type FulfillmentStatusProps = {
  fulfillmentStatus: string
}

type OrderStatusProps = {
  orderStatus: string
}

type ReturnStatusProps = {
  returnStatus: string
}

type RefundStatusProps = {
  refundStatus: string
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentStatus }) => {
  const { t } = useTranslation()
  switch (paymentStatus) {
    case "captured":
      return (
        <StatusIndicator
          title={t("orders.status.captured")}
          variant="success"
        />
      )
    case "awaiting":
      return (
        <StatusIndicator
          title={t("orders.status.awaiting")}
          variant="default"
        />
      )
    case "not_paid":
      return <StatusIndicator title="Not paid" variant="default" />
    case "canceled":
      return (
        <StatusIndicator title={t("orders.status.canceled")} variant="danger" />
      )
    case "requires_action":
      return <StatusIndicator title="Requires Action" variant="danger" />
    default:
      return null
  }
}

const OrderStatus: React.FC<OrderStatusProps> = ({ orderStatus }) => {
  const { t } = useTranslation()
  switch (orderStatus) {
    case "completed":
      return (
        <StatusIndicator
          title={t("orders.status.completed")}
          variant="success"
        />
      )
    case "pending":
      return (
        <StatusIndicator
          title={t("orders.status.processing")}
          variant="default"
        />
      )
    case "canceled":
      return (
        <StatusIndicator title={t("orders.status.canceled")} variant="danger" />
      )
    case "requires_action":
      return <StatusIndicator title="Rejected" variant="danger" />
    default:
      return null
  }
}

const FulfillmentStatus: React.FC<FulfillmentStatusProps> = ({
  fulfillmentStatus,
}) => {
  const { t } = useTranslation()

  switch (fulfillmentStatus) {
    case "shipped":
      return <StatusIndicator title="Shipped" variant="success" />
    case "fulfilled":
      return <StatusIndicator title="Fulfilled" variant="warning" />
    case "canceled":
      return (
        <StatusIndicator title={t("orders.status.canceled")} variant="danger" />
      )
    case "partially_fulfilled":
      return <StatusIndicator title="Partially fulfilled" variant="warning" />
    case "not_fulfilled":
      return <StatusIndicator title="Not fulfilled" variant="default" />
    case "requires_action":
      return <StatusIndicator title="Requires Action" variant="danger" />
    default:
      return null
  }
}

const ReturnStatus: React.FC<ReturnStatusProps> = ({ returnStatus }) => {
  const { t } = useTranslation()

  switch (returnStatus) {
    case "received":
      return <StatusIndicator title="Received" variant="success" />
    case "requested":
      return <StatusIndicator title="Requested" variant="default" />
    case "canceled":
      return (
        <StatusIndicator title={t("orders.status.canceled")} variant="danger" />
      )
    case "requires_action":
      return <StatusIndicator title="Requires Action" variant="danger" />
    default:
      return null
  }
}

const RefundStatus: React.FC<RefundStatusProps> = ({ refundStatus }) => {
  const { t } = useTranslation()

  switch (refundStatus) {
    case "na":
      return <StatusIndicator title="N/A" variant="default" />
    case "not_refunded":
      return <StatusIndicator title="已退款" variant="default" />
    case "refunded":
      return <StatusIndicator title="Refunded" variant="success" />
    default:
      return null
  }
}

export {
  PaymentStatus,
  OrderStatus,
  FulfillmentStatus,
  ReturnStatus,
  RefundStatus,
}
