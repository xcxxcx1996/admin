import React, { useMemo, useState } from "react"
import { useAdminProductTypes } from "medusa-react"
import { SelectableTable } from "./selectable-table"
import { useTranslation } from "react-i18next"

export const ProductTypeSelector = ({ items, onChange }) => {
  const PAGE_SIZE = 12
  const { t } = useTranslation()
  const [pagination, setPagination] = useState({
    limit: PAGE_SIZE,
    offset: 0,
  })

  const { isLoading, count, product_types } = useAdminProductTypes(pagination)

  const columns = useMemo(() => {
    return [
      {
        Header: t("common.name"),
        accessor: "value",
        Cell: ({ row: { original } }) => {
          return <div className="w-[200px]">{original.value}</div>
        },
      },
    ]
  }, [])

  return (
    <SelectableTable
      showSearch={false}
      label="Select Product Types"
      objectName="Product Types"
      totalCount={count}
      pagination={pagination}
      onPaginationChange={setPagination}
      selectedIds={items}
      data={product_types}
      columns={columns}
      isLoading={isLoading}
      onChange={onChange}
    />
  )
}
