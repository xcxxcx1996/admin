import { CustomerGroup } from "@medusajs/medusa"
import { navigate } from "gatsby"
import { useAdminCustomerGroups } from "medusa-react"
import React, { useContext } from "react"
import { useTranslation } from "react-i18next"
import {
  HeaderGroup,
  Row,
  TableInstance,
  TableOptions,
  usePagination,
  useSortBy,
  useTable,
} from "react-table"
import CustomerGroupContext, {
  CustomerGroupContextContainer,
} from "../../../domain/customers/groups/context/customer-group-context"
import useQueryFilters from "../../../hooks/use-query-filters"
import useSetSearchParams from "../../../hooks/use-set-search-params"
import DetailsIcon from "../../fundamentals/details-icon"
import EditIcon from "../../fundamentals/icons/edit-icon"
import Table, { TablePagination } from "../../molecules/table"
import { CUSTOMER_GROUPS_TABLE_COLUMNS } from "./config"

/**
 * Default filtering config for querying customer groups endpoint.
 */
const defaultQueryProps = {
  additionalFilters: { expand: "customers" },
  limit: 15,
  offset: 0,
}

/*
 * Customer groups empty state.
 */
function CustomerGroupsPlaceholder() {
  return (
    <div className="h-full flex center justify-center items-center min-h-[756px]">
      <span className="text-xs text-gray-400">还未创建客户组</span>
    </div>
  )
}

/* ******************************************** */
/* ************** TABLE ELEMENTS ************** */
/* ******************************************** */

type HeaderCellProps = {
  col: HeaderGroup<CustomerGroup>
}

/*
 * Renders react-table cell for the customer groups table.
 */
function CustomerGroupsTableHeaderCell(props: HeaderCellProps) {
  return (
    <Table.HeadCell
      className="w-[100px]"
      {...props.col.getHeaderProps(props.col.getSortByToggleProps())}
    >
      {props.col.render("Header")}
    </Table.HeadCell>
  )
}

type HeaderRowProps = {
  headerGroup: HeaderGroup<CustomerGroup>
}

/*
 * Renders react-table header row for the customer groups table.
 */
function CustomerGroupsTableHeaderRow(props: HeaderRowProps) {
  return (
    <Table.HeadRow {...props.headerGroup.getHeaderGroupProps()}>
      {props.headerGroup.headers.map((col) => (
        <CustomerGroupsTableHeaderCell key={col.id} col={col} />
      ))}
    </Table.HeadRow>
  )
}

type CustomerGroupsTableRowProps = {
  row: Row<CustomerGroup>
}

/*
 * Render react-table row for the customer groups table.
 */
function CustomerGroupsTableRow(props: CustomerGroupsTableRowProps) {
  const { row } = props
  const { showModal } = useContext(CustomerGroupContext)
  const { t } = useTranslation()
  const actions = [
    {
      label: t("common.edit"),
      onClick: showModal,
      icon: <EditIcon size={20} />,
    },
    {
      label: t("orders.field.detail"),
      onClick: () => navigate(row.original.id),
      icon: <DetailsIcon size={20} />,
    },
  ]

  return (
    <Table.Row
      color={"inherit"}
      actions={actions}
      linkTo={props.row.original.id}
      {...props.row.getRowProps()}
    >
      {props.row.cells.map((cell, index) => (
        <Table.Cell {...cell.getCellProps()}>
          {cell.render("Cell", { index })}
        </Table.Cell>
      ))}
    </Table.Row>
  )
}

/* ******************************************** */
/* ************* TABLE CONTAINERS ************* */
/* ******************************************** */

type CustomerGroupsTableProps = ReturnType<typeof useQueryFilters> & {
  customerGroups: CustomerGroup[]
  count: number
}

/*
 * Root component of the customer groups table.
 */
function CustomerGroupsTable(props: CustomerGroupsTableProps) {
  const { customerGroups, queryObject, count, paginate, setQuery } = props

  const tableConfig: TableOptions<CustomerGroup> = {
    columns: CUSTOMER_GROUPS_TABLE_COLUMNS,
    data: customerGroups || [],
    initialState: {
      pageSize: queryObject.limit,
      pageIndex: queryObject.offset / queryObject.limit,
    },
    pageCount: Math.ceil(count / queryObject.limit),
    manualPagination: true,
    autoResetPage: false,
  }

  const table: TableInstance<CustomerGroup> = useTable(
    tableConfig,
    useSortBy,
    usePagination
  )

  // ********* HANDLERS *********
  const { t } = useTranslation()
  const handleNext = () => {
    if (!table.canNextPage) {
      return
    }

    paginate(1)
    table.nextPage()
  }

  const handlePrev = () => {
    if (!table.canPreviousPage) {
      return
    }

    paginate(-1)
    table.previousPage()
  }

  const handleSearch = (text: string) => {
    setQuery(text)

    if (text) {
      table.gotoPage(0)
    }
  }

  // ********* RENDER *********

  return (
    <div className="w-full h-full overflow-y-auto flex flex-col justify-between">
      <Table
        enableSearch
        handleSearch={handleSearch}
        searchValue={queryObject.q}
        {...table.getTableProps()}
      >
        {/* HEAD */}
        <Table.Head>
          {table.headerGroups?.map((headerGroup, ind) => (
            <CustomerGroupsTableHeaderRow key={ind} headerGroup={headerGroup} />
          ))}
        </Table.Head>

        {/* BODY */}
        <Table.Body {...table.getTableBodyProps()}>
          {table.rows.map((row) => {
            table.prepareRow(row)
            return (
              <CustomerGroupContextContainer key={row.id} group={row.original}>
                <CustomerGroupsTableRow row={row} />
              </CustomerGroupContextContainer>
            )
          })}
        </Table.Body>
      </Table>

      {/* PAGINATION */}
      <TablePagination
        count={count}
        limit={queryObject.limit}
        offset={queryObject.offset}
        pageSize={queryObject.offset + table.rows.length}
        title={t("customers.title")}
        currentPage={table.state.pageIndex + 1}
        pageCount={table.pageCount}
        nextPage={handleNext}
        prevPage={handlePrev}
        hasNext={table.canNextPage}
        hasPrev={table.canPreviousPage}
      />
    </div>
  )
}

/*
 * A container component for the customers group table.
 * Handles data fetching and query params persistence.
 */
function CustomerGroupsTableContainer() {
  const params = useQueryFilters(defaultQueryProps)

  const { customer_groups, isLoading, count = 0 } = useAdminCustomerGroups(
    params.queryObject
  )

  useSetSearchParams(params.representationObject)

  const showPlaceholder = !customer_groups?.length && !params.queryObject.q

  if (showPlaceholder) {
    if (!isLoading) {
      return <CustomerGroupsPlaceholder />
    } else {
      return null
    }
  }

  return (
    <CustomerGroupsTable
      count={count}
      customerGroups={customer_groups || []}
      {...params}
    />
  )
}

export default CustomerGroupsTableContainer
