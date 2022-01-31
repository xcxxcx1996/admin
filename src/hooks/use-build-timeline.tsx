import {
  useAdminNotes,
  useAdminNotifications,
  useAdminOrder,
} from "medusa-react"
import { useMemo } from "react"

export interface TimelineEvent {
  id: string
  time: Date
  first?: boolean
  noNotification?: boolean
  type:
    | "payment"
    | "note"
    | "notification"
    | "placed"
    | "shipped"
    | "delivered"
    | "fulfilled"
    | "canceled"
    | "return"
    | "exchange"
    | "notification"
    | "claim"
}

interface CancelableEvent {
  canceledAt?: Date
  isCanceled?: boolean
}

export interface OrderPlacedEvent extends TimelineEvent {
  amount: number
  currency_code: string
  tax?: number
}

interface OrderItem {
  title: string
  quantity: number
  thumbnail?: string
  variant: {
    title: string
  }
}

interface ReturnItem extends OrderItem {
  requestedQuantity: number
  receivedQuantity: number
}

export interface ItemsFulfilledEvent extends TimelineEvent {
  items: OrderItem[]
}

export interface ItemsShippedEvent extends TimelineEvent {
  items: OrderItem[]
}

enum ReturnStatus {
  REQUESTED = "requested",
  RECEIVED = "received",
  REQUIRES_ACTION = "requires_action",
  CANCELED = "canceled",
}

export interface ReturnEvent extends TimelineEvent {
  items: ReturnItem[]
  status: ReturnStatus
  currentStatus?: ReturnStatus
}

export interface NoteEvent extends TimelineEvent {
  value: string
  authorId: string
}

export interface ExchangeEvent extends TimelineEvent, CancelableEvent {
  paymentStatus: string
  fulfillmentStatus: string
  returnStatus: string
  returnItems: ReturnItem[]
  newItems: OrderItem[]
  exchangeCartId?: string
}

export interface ClaimEvent extends TimelineEvent, CancelableEvent {
  fulfillmentStatus?: string
  refundStatus?: string
  refundAmount?: number
  currencyCode: string
  claimItems: OrderItem[]
  newItems: OrderItem[]
  claimType: string
}

export interface NotificationEvent extends TimelineEvent {
  to: string
  title: string
}

export const useBuildTimelime = (orderId: string) => {
  const { order, isLoading: orderLoading, isError: orderError } = useAdminOrder(
    orderId
  )
  const {
    notes,
    isLoading: notesLoading,
    isError: notesError,
  } = useAdminNotes({ resource_id: orderId, limit: 100, offset: 0 })
  const {
    notifications,
    isLoading: notificationsLoading,
    isError: notificationsError,
  } = useAdminNotifications({ resource_id: orderId })

  const events: TimelineEvent[] | undefined = useMemo(() => {
    if (!order) return undefined

    let allItems = [...order.items]

    if (order.swaps && order.swaps.length) {
      for (const swap of order.swaps) {
        allItems = [...allItems, ...swap.additional_items]
      }
    }

    if (order.claims && order.claims.length) {
      for (const claim of order.claims) {
        allItems = [...allItems, ...claim.additional_items]
      }
    }

    const events: TimelineEvent[] = []

    events.push({
      id: `${order.id}-placed`,
      time: order.created_at,
      amount: order.total,
      currency_code: order.currency_code,
      tax: order.tax_rate,
      type: "placed",
    } as OrderPlacedEvent)

    if (order.status === "canceled") {
      events.push({
        id: `${order.id}-canceled`,
        time: order.updated_at,
        type: "canceled",
      } as TimelineEvent)
    }

    if (notes) {
      for (const note of notes) {
        events.push({
          id: note.id,
          time: note.created_at,
          type: "note",
          authorId: note.author_id,
          value: note.value,
        } as NoteEvent)
      }
    }

    for (const event of order.fulfillments) {
      events.push({
        id: event.id,
        time: event.created_at,
        type: "fulfilled",
        items: event.items.map((item) => getLineItem(allItems, item.item_id)),
        noNotification: event.no_notification,
      } as ItemsFulfilledEvent)

      if (event.shipped_at) {
        events.push({
          id: event.id,
          time: event.shipped_at,
          type: "shipped",
          items: event.items.map((item) => getLineItem(allItems, item.item_id)),
          noNotification: event.no_notification,
        } as ItemsShippedEvent)
      }
    }

    for (const event of order.returns) {
      events.push({
        id: event.id,
        items: event.items.map((i) => getReturnItems(allItems, i)),
        status: event.status,
        currentStatus: event.status,
        time: event.updated_at,
        type: "return",
        noNotification: event.no_notification,
      } as ReturnEvent)

      if (event.status !== "requested") {
        events.push({
          id: event.id,
          items: event.items.map((i) => getReturnItems(allItems, i)),
          status: "requested",
          time: event.created_at,
          type: "return",
          currentStatus: event.status,
          noNotification: event.no_notification,
        } as ReturnEvent)
      }
    }

    for (const event of order.swaps) {
      events.push({
        id: event.id,
        time: event.canceled_at ? event.canceled_at : event.created_at,
        noNotification: event.no_notification === true, //type error
        fulfillmentStatus: event.fulfillment_status,
        paymentStatus: event.payment_status,
        returnStatus: event.return_order.status,
        type: "exchange",
        newItems: event.additional_items.map((i) => getSwapItem(i)),
        returnItems: event.return_order.items.map((i) =>
          getReturnItems(allItems, i)
        ),
        exchangeCartId:
          event.payment_status !== "captured" && !event.canceled_at
            ? event.cart_id
            : undefined,
        canceledAt: event.canceled_at,
      } as ExchangeEvent)

      if (event.canceled_at) {
        events.push({
          id: event.id,
          time: event.created_at,
          noNotification: event.no_notification === true, //type error
          fulfillmentStatus: event.fulfillment_status,
          paymentStatus: event.payment_status,
          returnStatus: event.return_order.status,
          type: "exchange",
          newItems: event.additional_items.map((i) => getSwapItem(i)),
          returnItems: event.return_order.items.map((i) =>
            getReturnItems(allItems, i)
          ),
          exchangeCartId:
            event.payment_status !== "captured" && !event.canceled_at
              ? event.cart_id
              : undefined,
          isCanceled: true,
        } as ExchangeEvent)
      }
    }

    if (order.claims) {
      for (const claim of order.claims) {
        events.push({
          id: claim.id,
          type: "claim",
          newItems: claim.additional_items.map((i) => ({
            quantity: i.quantity,
            title: i.title,
            thumbnail: i.thumbnail,
            variant: {
              title: i.variant.title,
            },
          })),
          fulfillmentStatus: claim.fulfillment_status,
          refundStatus: claim.payment_status,
          refundAmount: claim.refund_amount,
          currencyCode: order.currency_code,
          claimItems: claim.claim_items.map((i) => getClaimItem(i)),
          time: claim.canceled_at ? claim.canceled_at : claim.created_at,
          noNotification: claim.no_notification,
          claimType: claim.type,
          canceledAt: claim.canceled_at,
        } as ClaimEvent)

        if (claim.canceled_at) {
          events.push({
            id: `${claim.id}-created`,
            type: "claim",
            newItems: claim.additional_items.map((i) => ({
              quantity: i.quantity,
              title: i.title,
              thumbnail: i.thumbnail,
              variant: {
                title: i.variant.title,
              },
            })),
            fulfillmentStatus: claim.fulfillment_status,
            refundStatus: claim.payment_status,
            refundAmount: claim.refund_amount,
            currencyCode: order.currency_code,
            claimItems: claim.claim_items.map((i) => getClaimItem(i)),
            time: claim.created_at,
            noNotification: claim.no_notification,
            claimType: claim.type,
            isCanceled: true,
          } as ClaimEvent)
        }
      }
    }

    if (notifications) {
      for (const notification of notifications) {
        events.push({
          id: notification.id,
          time: notification.created_at,
          to: notification.to,
          type: "notification",
          title: notification.event_name,
        } as NotificationEvent)
      }
    }

    events.sort((a, b) => {
      if (a.time > b.time) {
        return -1
      }

      if (a.time < b.time) {
        return 1
      }

      return 0
    })

    events[events.length - 1].first = true

    return events
  }, [
    order,
    orderLoading,
    orderError,
    notes,
    notesLoading,
    notesError,
    notifications,
    notificationsLoading,
    notificationsError,
  ])

  return { events }
}

function getLineItem(allItems, itemId) {
  const line = allItems.find((line) => line.id === itemId)

  if (!line) return

  return {
    title: line.title,
    quantity: line.quantity,
    thumbnail: line.thumbnail,
    variant: { title: line.variant.title },
  }
}

function getReturnItems(allItems, item) {
  const line = allItems.find((li) => li.id === item.item_id)

  if (!line) return

  return {
    title: line.title,
    quantity: item.quantity,
    requestedQuantity: item.requested_quantity,
    receivedQuantity: item.received_quantity,
    variant: {
      title: line.variant.title,
    },
    thumbnail: line.thumbnail,
  }
}

function getClaimItem(claimItem) {
  return {
    title: claimItem.item.title,
    quantity: claimItem.quantity,
    thumbnail: claimItem.item.thumbnail,
    variant: {
      title: claimItem.item.variant.title,
    },
  }
}

function getSwapItem(item) {
  return {
    title: item.title,
    quantity: item.quantity,
    thumbnail: item.thumbnail,
    variant: { title: item.variant.title },
  }
}
