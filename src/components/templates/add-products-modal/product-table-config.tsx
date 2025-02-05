import * as React from "react"
import { Product } from "@medusajs/medusa"
import { Column, HeaderGroup, Row } from "react-table"
import Table from "../../molecules/table"
import ImagePlaceholderIcon from "../../fundamentals/icons/image-placeholder-icon"
import { decideStatus } from "../collection-product-table/utils"
import clsx from "clsx"

export const columns: Column<Product>[] = [
  {
    Header: <Table.HeadCell className="pl-4">Product Details</Table.HeadCell>,
    accessor: "title",
    Cell: ({ row: { original } }) => (
      <div className="pl-4 flex items-center w-[400px]">
        <div className="h-[40px] w-[30px] my-1.5 flex items-center mr-4">
          {original.thumbnail ? (
            <img
              src={original.thumbnail}
              className="h-full object-cover rounded-soft"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full rounded-soft bg-grey-10">
              <ImagePlaceholderIcon size={16} />
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span>
            {original.title}{" "}
            {original.subtitle && (
              <span className="text-grey-50">({original.subtitle})</span>
            )}
          </span>
        </div>
      </div>
    ),
  },
  {
    Header: <Table.HeadCell>状态</Table.HeadCell>,
    accessor: "status",
    Cell: ({ cell: { value } }) => (
      <Table.Cell className="w-[10%] pr-base">
        <div className="flex items-center">{decideStatus(value)}</div>
      </Table.Cell>
    ),
  },
  {
    Header: (
      <Table.HeadCell className="flex justify-end items-center pr-4">
        Variants
      </Table.HeadCell>
    ),
    accessor: "variants",
    Cell: ({ row: { original } }) => (
      <Table.Cell className="flex justify-end items-center pr-4">
        {original.variants.length}
      </Table.Cell>
    ),
  },
]

export const ProductRow = ({ row }: { row: Row<Product> }) => {
  const { isSelected } = row
  return (
    <Table.Row
      {...row.getRowProps()}
      className={clsx({ "bg-grey-5": isSelected })}
    >
      {row.cells.map((cell) => {
        return (
          <Table.Cell {...cell.getCellProps()}>
            {cell.render("Cell")}
          </Table.Cell>
        )
      })}
    </Table.Row>
  )
}

export const ProductHeader = ({
  headerGroup,
}: {
  headerGroup: HeaderGroup<Product>
}) => {
  return (
    <Table.HeadRow {...headerGroup.getHeaderGroupProps()}>
      {headerGroup.headers.map((col) => (
        <Table.HeadCell {...col.getHeaderProps(col.getSortByToggleProps())}>
          {col.render("Header")}
        </Table.HeadCell>
      ))}
    </Table.HeadRow>
  )
}
