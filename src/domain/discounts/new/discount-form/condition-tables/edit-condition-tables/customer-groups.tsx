import { useAdminCustomerGroups } from "medusa-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Spinner from "../../../../../../components/atoms/spinner"
import Modal from "../../../../../../components/molecules/modal"
import useQueryFilters from "../../../../../../hooks/use-query-filters"
import { DiscountConditionOperator } from "../../../../types"
import { useDiscountForm } from "../../form/discount-form-context"
import { defaultQueryProps } from "../shared/common"
import ConditionOperator from "../shared/condition-operator"
import {
  CustomerGroupsHeader,
  CustomerGroupsRow,
  useGroupColumns,
} from "../shared/groups"
import { SelectableTable } from "../shared/selectable-table"
import EditConditionFooter from "./edit-condition-footer"

const EditCustomerGroupConditionSelector = ({ onClose }) => {
  const params = useQueryFilters(defaultQueryProps)
  const { conditions } = useDiscountForm()
  const [items, setItems] = useState(conditions.customer_groups?.items || [])
  const [operator, setOperator] = useState<DiscountConditionOperator>(
    conditions.customer_groups.operator
  )
  const { t } = useTranslation()

  const { isLoading, count, customer_groups } = useAdminCustomerGroups(
    params.queryObject,
    {
      // avoid UI flickering by keeping previous data
      keepPreviousData: true,
    }
  )

  const changed = (values: string[]) => {
    const selectedCustomerGroups =
      customer_groups?.filter((cg) => values.includes(cg.id)) || []

    setItems(
      selectedCustomerGroups.map((customer_group) => ({
        id: customer_group.id,
        label: customer_group.name,
      }))
    )
  }

  const columns = useGroupColumns()

  return (
    <>
      <Modal.Content isLargeModal={true}>
        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <ConditionOperator value={operator} onChange={setOperator} />
            <SelectableTable
              options={{
                enableSearch: true,
                immediateSearchFocus: true,
                searchPlaceholder: t("discounts.search.groups"),
              }}
              resourceName={t("customers.groups.title")}
              totalCount={count || 0}
              selectedIds={items.map((i) => i.id)}
              data={customer_groups}
              columns={columns}
              isLoading={isLoading}
              onChange={changed}
              renderRow={CustomerGroupsRow}
              renderHeaderGroup={CustomerGroupsHeader}
              {...params}
            />
          </>
        )}
      </Modal.Content>
      <Modal.Footer isLargeModal>
        <EditConditionFooter
          type="customer_groups"
          items={items}
          operator={operator}
          onClose={onClose}
        />
      </Modal.Footer>
    </>
  )
}

export default EditCustomerGroupConditionSelector
