import React from "react"
import { DisplayTotal } from "./display-total"
import { useTranslation } from "react-i18next"

export const PaymentDetails = ({
  currency,
  swapAmount,
  manualRefund,
  swapRefund,
  returnRefund,
  paidTotal,
  refundedTotal,
}) => {
  if (swapAmount + manualRefund + swapRefund + returnRefund === 0) {
    return null
  }
  const { t } = useTranslation()
  return (
    <>
      {!!swapAmount && (
        <DisplayTotal
          currency={currency}
          totalAmount={swapAmount}
          totalTitle={t("orders.field.total_swap")}
        />
      )}
      {!!swapRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={returnRefund}
          totalTitle={t("orders.field.refunded_swap")}
        />
      )}
      {!!returnRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={returnRefund}
          totalTitle={t("orders.field.refunded_return")}
        />
      )}
      {!!manualRefund && (
        <DisplayTotal
          currency={currency}
          totalAmount={manualRefund}
          totalTitle={t("orders.field.manually_refunded")}
        />
      )}
      <DisplayTotal
        variant={"bold"}
        currency={currency}
        totalAmount={paidTotal - refundedTotal}
        totalTitle={t("orders.field.net_total")}
      />
    </>
  )
}
