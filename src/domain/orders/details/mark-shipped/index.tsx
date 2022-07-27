import {
  AdminOrdersRes,
  ClaimOrder,
  Fulfillment,
  Order,
  Swap,
} from "@medusajs/medusa"
import {
  useAdminCreateClaimShipment,
  useAdminCreateShipment,
  useAdminCreateSwapShipment,
} from "medusa-react"
import React, { useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import Button from "../../../../components/fundamentals/button"
import CheckIcon from "../../../../components/fundamentals/icons/check-icon"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Input from "../../../../components/molecules/input"
import Modal from "../../../../components/molecules/modal"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"
import { useMutation, UseMutationOptions, useQueryClient } from "react-query"
import api from "../../../../services/api"
import Select from "../../../../components/molecules/select"

type MarkShippedModalProps = {
  orderId: string
  orderToShip: Order | Swap | ClaimOrder
  fulfillment: Fulfillment
  handleCancel: () => void
}

type ISelectOptions = {
  label: string
  value: string
  disabled?: boolean
}[]

const collectionOptions: ISelectOptions = [
  { value: "ems", label: "EMS" },
  { value: "youzhengbk", label: "邮政标准快递" },
  { value: "debangkuaidi", label: "德邦快递" },
  { value: "huitongkuaidi", label: "百世快递" },
  { value: "zhongtongkuaiyun", label: "中通快运" },
  { value: "yuantong", label: "圆通速递" },
  { value: "zhongtong", label: "中通快递" },
  { value: "yunda", label: "韵达快递" },
  { value: "shunfeng", label: "顺丰速运" },
  { value: "shentong", label: "申通快递" },
]
type AdminPostOrdersOrderFullShipmentReq = {
  fulfillment_id: string
  tracking_numbers?: string[]
  no_notification?: boolean
  metadata?: {
    num: string
    com: {
      value: string
      lable: string
    }
    ship_to: string
  }
}
const useAdminCreateFullShipment = (orderId: string) => {
  return useMutation((payload: AdminPostOrdersOrderFullShipmentReq) => {
    return api.orders.createFullShipment(orderId, payload)
  })
}

const MarkShippedModal: React.FC<MarkShippedModalProps> = ({
  orderId,
  orderToShip,
  fulfillment,
  handleCancel,
}) => {
  const { control, register, watch } = useForm({})
  const [noNotis, setNoNotis] = useState(false)
  const [company, setCompany] = useState(collectionOptions[0])
  const [shipTo, setShipTo] = useState("长沙")
  const {
    fields,
    append: appendTracking,
    remove: removeTracking,
  } = useFieldArray({
    control,
    name: "tracking_numbers",
  })

  useEffect(() => {
    appendTracking({
      value: "",
    })
  }, [])

  const watchedFields = watch("tracking_numbers")

  // Allows us to listen to onChange events
  const trackingNumbers = fields.map((field, index) => ({
    ...field,
    ...watchedFields[index],
  }))

  const markOrderShipped = useAdminCreateShipment(orderId)
  const markSwapShipped = useAdminCreateSwapShipment(orderId)
  const markClaimShipped = useAdminCreateClaimShipment(orderId)
  const markOrderShippedtest = useAdminCreateFullShipment(orderId)

  const notification = useNotification()
  const { t } = useTranslation()
  const markShipped = () => {
    const resourceId =
      fulfillment.claim_order_id || fulfillment.swap_id || fulfillment.order_id
    const [type] = resourceId.split("_")

    const tracking_numbers = trackingNumbers.map(({ value }) => value)

    type actionType =
      | typeof markOrderShipped
      | typeof markSwapShipped
      | typeof markClaimShipped

    let action: actionType = markOrderShipped
    let successText = "Successfully marked order as shipped"
    let requestObj

    switch (type) {
      case "order":
        action = markOrderShippedtest
        requestObj = {
          fulfillment_id: fulfillment.id,
          tracking_numbers,
          no_notification: noNotis,
          metadata: {
            com: company,
            ship_to: shipTo,
            num: tracking_numbers[0],
          },
        }
        break
      case "swap":
        action = markSwapShipped
        requestObj = {
          fulfillment_id: fulfillment.id,
          swap_id: resourceId,
          tracking_numbers,
          no_notification: noNotis,
        }
        successText = t("orders.notification.mark_swap_success")
        break

      case "claim":
        action = markClaimShipped
        requestObj = {
          fulfillment_id: fulfillment.id,
          claim_id: resourceId,
          tracking_numbers,
        }
        successText = t("orders.notification.mark_claim_success")
        break

      default:
        requestObj = {
          fulfillment_id: fulfillment.id,
          tracking_numbers,
          no_notification: noNotis,
        }
        break
    }

    action.mutate(requestObj, {
      onSuccess: () => {
        notification(t("common.status.success"), successText, "success")
        handleCancel()
      },
      onError: (err) =>
        notification(t("common.status.error"), getErrorMessage(err), "error"),
    })
  }

  return (
    <Modal handleClose={handleCancel}>
      <Modal.Body>
        <Modal.Header handleClose={handleCancel}>
          <span className="inter-xlarge-semibold">
            {t("orders.actions.mark_shipped")}
          </span>
        </Modal.Header>
        <Modal.Content>
          <div className="flex flex-col">
            <span className="inter-base-semibold mb-2">Tracking</span>
            <div className="flex flex-col space-y-2">
              {trackingNumbers.map((tn, index) => (
                <Input
                  key={tn.id}
                  deletable={index !== 0}
                  label={index === 0 ? "Tracking number" : ""}
                  type="text"
                  placeholder={"Tracking number..."}
                  name={`tracking_numbers[${index}].value`}
                  ref={register({
                    required: "Must be filled",
                  })}
                  onDelete={() => removeTracking(index)}
                />
              ))}
              <Select
                label="快递"
                name="company"
                value={company}
                required={true}
                // overrideStrings={{ selectSomeItems: "选择 快递公司..." }}
                options={collectionOptions}
                onChange={(e) => {
                  console.log(e)
                  setCompany(e)
                }}
              />
              <Input
                key={"com"}
                deletable={false}
                label={"寄往城市"}
                type="text"
                placeholder={"城市名,如长沙或 湖南长沙"}
                required={true}
                name={"shipTo"}
                ref={register({
                  required: "Must be filled",
                })}
                onChange={(e) => {
                  setShipTo(e.target.value)
                }}
              />
            </div>
          </div>
          <div className="flex w-full justify-end mt-4">
            <Button
              size="small"
              onClick={() => appendTracking({ key: "", value: "" })}
              variant="secondary"
              disabled={trackingNumbers.some((tn) => !tn.value)}
            >
              {t("orders.actions.add_tracking_number")}
            </Button>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full h-8 justify-between">
            <div
              className="items-center h-full flex cursor-pointer"
              onClick={() => setNoNotis(!noNotis)}
            >
              <div
                className={`w-5 h-5 flex justify-center text-grey-0 border-grey-30 border rounded-base ${
                  !noNotis && "bg-violet-60"
                }`}
              >
                <span className="self-center">
                  {!noNotis && <CheckIcon size={16} />}
                </span>
              </div>
              <input
                id="noNotification"
                className="hidden"
                name="noNotification"
                checked={!noNotis}
                type="checkbox"
              />
              <span className="ml-3 flex items-center text-grey-90 gap-x-xsmall">
                {t("orders.actions.send_notification")}
                <IconTooltip content="" />
              </span>
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                className="mr-2 w-32 text-small justify-center"
                size="large"
                onClick={handleCancel}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="large"
                className="w-32 text-small justify-center"
                variant="primary"
                onClick={markShipped}
              >
                {t("orders.actions.complete")}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default MarkShippedModal
