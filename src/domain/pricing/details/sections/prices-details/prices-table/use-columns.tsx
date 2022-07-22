import { Product } from "@medusajs/medusa"
import * as React from "react"
import { Column } from "react-table"
import ImagePlaceholder from "../../../../../../components/fundamentals/image-placeholder"
import Table from "../../../../../../components/molecules/table"
import { useTranslation } from "react-i18next"

const usePricesColumns = () => {
  const { t } = useTranslation()
  const columns = React.useMemo<Column<Product>[]>(
    () => [
      {
        Header: (
          <Table.HeadCell className="pl-4">{t("common.name")}</Table.HeadCell>
        ),
        accessor: "title",
        Cell: ({ row: { original } }) => (
          <div className="pl-4 flex items-center">
            <div className="h-[40px] w-[30px] my-1.5 flex items-center mr-4">
              {original.thumbnail ? (
                <img
                  src={original.thumbnail}
                  className="h-full object-cover rounded-soft"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full rounded-soft bg-grey-10">
                  <ImagePlaceholder size={16} />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span>{original.title}</span>
            </div>
          </div>
        ),
      },
      {
        Header: (
          <Table.HeadCell className="w-[400px]">
            {t("products.collection")}
          </Table.HeadCell>
        ),
        accessor: "collection",
        Cell: ({ cell: { value } }) => (
          <Table.Cell>
            {value?.title ? (
              value.title
            ) : (
              <span className="text-grey-40">
                {"当前无集合(No collection)"}
              </span>
            )}
          </Table.Cell>
        ),
      },
      {
        Header: "商品子类",
        Cell: ({ row: { original } }) => (
          <Table.Cell>{original.variants.length}</Table.Cell>
        ),
      },
    ],
    []
  )

  return columns
}
export default usePricesColumns
