import { useAdminCancelClaim } from "medusa-react"
import React, { useState } from "react"
import { ClaimEvent } from "../../../hooks/use-build-timeline"
import { formatAmountWithSymbol } from "../../../utils/prices"
import AlertIcon from "../../fundamentals/icons/alert-icon"
import CancelIcon from "../../fundamentals/icons/cancel-icon"
import CheckCircleIcon from "../../fundamentals/icons/check-circle-icon"
import TrashIcon from "../../fundamentals/icons/trash-icon"
import DeletePrompt from "../../organisms/delete-prompt"
import { ActionType } from "../actionables"
import { FulfillmentStatus, RefundStatus } from "../order-status"
import EventActionables from "./event-actionables"
import EventContainer, { EventIconColor } from "./event-container"
import EventItemContainer from "./event-item-container"

type ClaimProps = {
  event: ClaimEvent
}

const Claim: React.FC<ClaimProps> = ({ event }) => {
  const cancelClaim = useAdminCancelClaim(event.id)
  const [showCancel, setShowCancel] = useState(false)

  const handleCancel = () => {
    cancelClaim.mutate("") // error on hook endpoint is /admin/orders/claim_01FTRG93AK830MS285CB20CBJW/claims//cancel
  }

  const handleFulfill = () => {
    console.log("TODO")
  }

  const claimItems = ClaimItems(event)
  const claimStatus = ClaimStatus(event)
  const refundOrReplacement = ClaimRefundOrReplacement(event)
  const actions = ClaimActions(event, handleCancel, handleFulfill)

  const args = {
    icon: event.canceledAt ? <CancelIcon size={20} /> : <AlertIcon size={20} />,
    iconColor: event.canceledAt
      ? EventIconColor.DEFAULT
      : EventIconColor.ORANGE,
    time: event.canceledAt ? event.canceledAt : event.time,
    title: event.canceledAt ? "Claim Canceled" : "Claim Created",
    topNode: actions,
    children: [
      <div className="flex flex-col gap-y-base">
        {!event.canceledAt && (
          <>
            {claimStatus}
            {claimItems}
            {refundOrReplacement}
          </>
        )}
      </div>,
    ],
  }

  return (
    <>
      <EventContainer {...args} />
      {showCancel && (
        <DeletePrompt
          handleClose={() => setShowCancel(false)}
          onDelete={async () => handleCancel()}
        />
      )}
    </>
  )
}

function ClaimItems(event: ClaimEvent) {
  return (
    <div className="flex flex-col gap-y-small">
      <span className="inter-small-regular text-grey-50">Claimed items</span>
      <div>
        {event.claimItems.map((i) => (
          <EventItemContainer item={i} />
        ))}
      </div>
    </div>
  )
}

function ClaimStatus(event: ClaimEvent) {
  return event.claimType === "refund" && event.refundStatus ? (
    <div>
      <span className="text-grey-50 mb-2xsmall">Refund:</span>
      <RefundStatus refundStatus={event.refundStatus} />
    </div>
  ) : event.claimType === "return" && event.fulfillmentStatus ? (
    <div>
      <span className="text-grey-50 mb-2xsmall">Fulfillment:</span>
      <FulfillmentStatus fulfillmentStatus={event.fulfillmentStatus} />
    </div>
  ) : null
}

function ClaimRefundOrReplacement(event: ClaimEvent) {
  return event.claimType === "replace" ? (
    <div className="flex flex-col gap-y-small">
      <span className="inter-small-regular text-grey-50">New items</span>
      <div>
        {event.newItems.map((i) => (
          <EventItemContainer item={i} />
        ))}
      </div>
    </div>
  ) : (
    <div className="flex flex-col">
      <span className="text-grey-50 mb-2xsmall">{`${
        event.refundStatus && event.refundStatus === "refunded"
          ? "Refunded"
          : "Refund"
      } amount:`}</span>
      <span className="inter-small-semibold">
        {formatAmountWithSymbol({
          amount: event.refundAmount,
          currency: event.currencyCode,
          tax: 0,
          digits: 2,
        })}
      </span>
    </div>
  )
}

function ClaimActions(
  event: ClaimEvent,
  onCancel: () => void,
  onFulfill: () => void
) {
  const actions: ActionType[] = []

  if (event.canceledAt || event.isCanceled) return null

  if (
    event.claimType === "replace" &&
    (event.fulfillmentStatus === "not_fulfilled" ||
      event.fulfillmentStatus === "canceled")
  ) {
    actions.push({
      icon: <CheckCircleIcon size={20} />,
      label: "Fulfill Claim",
      onClick: onFulfill,
    })
  }

  if (event.refundStatus !== "refunded" && !event.isCanceled) {
    actions.push({
      icon: <TrashIcon size={20} />,
      label: "Cancel Claim",
      variant: "danger",
      onClick: onCancel,
    })
  }

  return actions.length ? <EventActionables actions={actions} /> : null
}

export default Claim
