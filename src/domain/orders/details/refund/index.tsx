import { useAdminRefundPayment } from "medusa-react"
import React, { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import Button from "../../../../components/fundamentals/button"
import AlertIcon from "../../../../components/fundamentals/icons/alert-icon"
import CheckIcon from "../../../../components/fundamentals/icons/check-icon"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Modal from "../../../../components/molecules/modal"
import Select from "../../../../components/molecules/select"
import TextArea from "../../../../components/molecules/textarea"
import CurrencyInput from "../../../../components/organisms/currency-input"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"

const RefundMenu = ({ order, onDismiss }) => {
  const { register, handleSubmit, control } = useForm()
  const { t } = useTranslation()
  const [noNotification, setNoNotification] = useState(order.no_notification)

  const notification = useNotification()
  const createRefund = useAdminRefundPayment(order.id)

  const refundable = useMemo(() => {
    return order.paid_total - order.refunded_total
  }, [order])

  const reasonOptions = [
    { label: "Discount", value: "discount" },
    { label: t("orders.field.other"), value: "other" },
  ]

  const handleValidateRefundAmount = (value) => {
    return value <= refundable
  }

  const onSubmit = (data, e) => {
    createRefund.mutate(
      {
        amount: data.amount,
        reason: data.reason.value,
        no_notification: noNotification,
        note: data.note,
      },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("orders.notification.refund_order_success"),
            "success"
          )
          onDismiss()
        },
        onError: (error) => {
          notification(
            t("common.status.error"),
            getErrorMessage(error),
            "error"
          )
        },
      }
    )
  }

  const isSystemPayment = order.payments.some((p) => p.provider_id === "system")

  return (
    <Modal handleClose={onDismiss}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={onDismiss}>
            <h2 className="inter-xlarge-semibold">
              {t("orders.actions.create_refund")}
            </h2>
          </Modal.Header>
          <Modal.Content>
            {isSystemPayment && (
              <div className="inter-small-regular mb-6 p-4 text-orange-50 bg-orange-5 rounded-rounded flex text-grey-50">
                <div className="h-full mr-3">
                  <AlertIcon size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="inter-small-semibold">
                    {t("orders.actions.attention")}
                  </span>
                  {t("orders.description.attention")}
                </div>
              </div>
            )}
            <span className="inter-base-semibold">
              {t("orders.field.detail")}
            </span>
            <div className="grid gap-y-base mt-4">
              <CurrencyInput
                size="small"
                currentCurrency={order.currency_code}
                readOnly
              >
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: true, min: 1 }}
                  render={(props) => (
                    <CurrencyInput.AmountInput
                      label={t("orders.field.refund_amount")}
                      amount={props.value}
                      invalidMessage={`Cannot refund more than the order's net total.`}
                      onValidate={handleValidateRefundAmount}
                      onChange={props.onChange}
                    />
                  )}
                />
              </CurrencyInput>
              <Controller
                name="reason"
                control={control}
                defaultValue={{
                  label: t("orders.field.discount"),
                  value: "discount",
                }}
                rules={{ required: true }}
                render={(props) => (
                  <Select
                    label={t("orders.field.reason")}
                    options={reasonOptions}
                    value={props.value}
                    onChange={props.onChange}
                  />
                )}
              />
              <TextArea
                name="note"
                label={t("orders.field.note")}
                placeholder="Discount for loyal customer"
                ref={register}
              />
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex w-full  justify-between">
              <div
                className="items-center h-full flex cursor-pointer"
                onClick={() => setNoNotification(!noNotification)}
              >
                <div
                  className={`w-5 h-5 flex justify-center text-grey-0 border-grey-30 border rounded-base ${
                    !noNotification && "bg-violet-60"
                  }`}
                >
                  <span className="self-center">
                    {!noNotification && <CheckIcon size={16} />}
                  </span>
                </div>
                <input
                  id="noNotification"
                  className="hidden"
                  name="noNotification"
                  checked={!noNotification}
                  onChange={() => setNoNotification(!noNotification)}
                  type="checkbox"
                />
                <span className="ml-3 flex items-center text-grey-90 gap-x-xsmall">
                  {t("orders.actions.send_notification")}
                  <IconTooltip content="Notify customer of created return" />
                </span>
              </div>
              <div className="flex gap-x-xsmall">
                <Button
                  onClick={onDismiss}
                  size="small"
                  className="w-[112px]"
                  variant="ghost"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  size="small"
                  className="w-[112px]"
                  variant="primary"
                >
                  {t("orders.actions.complete")}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  )
}

export default RefundMenu
