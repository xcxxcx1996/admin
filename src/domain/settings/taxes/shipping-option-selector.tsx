import React, { useMemo, useState } from "react"
import { useAdminShippingOptions } from "medusa-react"
import { SelectableTable } from "./selectable-table"
import { useTranslation } from "react-i18next"

export const ShippingOptionSelector = ({ regionId, items, onChange }) => {
  const PAGE_SIZE = 12
  const { t } = useTranslation()
  const [pagination, setPagination] = useState({
    limit: PAGE_SIZE,
    offset: 0,
  })

  const { isLoading, count, shipping_options } = useAdminShippingOptions({
    region_id: regionId,
  })

  const columns = useMemo(() => {
    return [
      {
        Header: t("common.name"),
        accessor: "name",
        Cell: ({ row: { original } }) => {
          return <div className="w-[200px]">{original.name}</div>
        },
      },
    ]
  }, [])

  return (
    <SelectableTable
      showSearch={false}
      label={t("settings.tax.select_option")}
      objectName={t("settings.region.option")}
      totalCount={count}
      pagination={pagination}
      onPaginationChange={setPagination}
      selectedIds={items}
      data={shipping_options}
      columns={columns}
      isLoading={isLoading}
      onChange={onChange}
    />
  )
}
