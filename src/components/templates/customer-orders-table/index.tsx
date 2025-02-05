import { RouteComponentProps } from "@reach/router"
import { useAdminOrders } from "medusa-react"
import moment from "moment"
import React, { useRef } from "react"
import { useObserveWidth } from "../../../hooks/use-observe-width"
import { stringDisplayPrice } from "../../../utils/prices"
import StatusDot from "../../fundamentals/status-indicator"
import Table from "../../molecules/table"
import { useTranslation } from "react-i18next"

type CustomerOrdersTableProps = {
  customerId: string
} & RouteComponentProps

const CustomerOrdersTable: React.FC<CustomerOrdersTableProps> = ({
  customerId,
}) => {
  // TODO: Use react-table
  // I've hard coded the limit to 14 for now, since it's quite rare
  // to have customers putting in that many orders. This is only until
  // we've successfully implemented react-table, that will allow us
  // to add pagination
  const { orders, isLoading } = useAdminOrders({
    customer_id: customerId,
    offset: 0,
    limit: 14,
    expand: "items",
  })
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const width = useObserveWidth(containerRef)

  const calcImages = (order) => {
    console.log(order)
    const columns = Math.max(Math.floor(width / 20) - 1, 1)
    const visibleImages = order.items?.slice(0, columns)
    const remainder = order.items?.length - columns

    return { visibleImages, remainder }
  }

  const decideStatus = (order) => {
    switch (order.payment_status) {
      case "captured":
        return (
          <StatusDot variant="success" title={t("orders.status.captured")} />
        )
      case "awaiting":
        return (
          <StatusDot variant="warning" title={t("orders.status.awaiting")} />
        )
      case "requires":
        return (
          <StatusDot
            variant="danger"
            title={t("orders.status.request_action")}
          />
        )
      default:
        return <StatusDot variant="primary" title={"N/A"} />
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <Table>
        <Table.Head>
          <Table.HeadRow>
            <Table.HeadCell className="w-[75px]">
              {t("orders.general.order")}
            </Table.HeadCell>
            <Table.HeadCell />
            <Table.HeadCell>{t("common.date")}</Table.HeadCell>
            <Table.HeadCell>{t("settings.region.fulfillment")}</Table.HeadCell>
            <Table.HeadCell>{t("orders.field.status")}</Table.HeadCell>
            <Table.HeadCell>{t("common.total")}</Table.HeadCell>
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {orders?.map((order, index) => {
            const { remainder, visibleImages } = calcImages(order)

            return (
              <Table.Row
                key={`invite-${index}`}
                linkTo={`/a/orders/${order.id}`}
                className="py-2"
              >
                <Table.Cell className="text-grey-90 w-20">
                  #{order.display_id}
                </Table.Cell>
                <Table.Cell className="w-40 flex">
                  <div
                    ref={containerRef}
                    className="flex space-x-1 w-[60px] mr-2 items-center"
                  >
                    {visibleImages?.map((tag) => (
                      <div className="h-[35px] w-[25px] flex items-center ">
                        <img
                          className="rounded object-cover"
                          src={tag.thumbnail}
                        />
                      </div>
                    ))}
                  </div>
                  {remainder > 0 && (
                    <div className="flex items-center text-grey-40 inter-small-regular">
                      + {remainder} more
                    </div>
                  )}
                </Table.Cell>
                <Table.Cell className="">
                  {moment(order.created_at).format("DD MMM YYYY hh:mm")}
                </Table.Cell>
                <Table.Cell className="">{order.fulfillment_status}</Table.Cell>
                <Table.Cell className="truncate">
                  {decideStatus(order)}
                </Table.Cell>
                <Table.Cell className="">
                  {stringDisplayPrice({
                    amount: order.total,
                    currencyCode: order.currency_code,
                  })}
                </Table.Cell>
                <Table.Cell />
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
    </div>
  )
}

export default CustomerOrdersTable
