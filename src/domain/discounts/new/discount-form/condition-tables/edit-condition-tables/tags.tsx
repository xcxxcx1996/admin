import { useAdminProductTags } from "medusa-react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import Spinner from "../../../../../../components/atoms/spinner"
import Modal from "../../../../../../components/molecules/modal"
import useQueryFilters from "../../../../../../hooks/use-query-filters"
import { DiscountConditionOperator } from "../../../../types"
import { useDiscountForm } from "../../form/discount-form-context"
import { defaultQueryProps } from "../shared/common"
import ConditionOperator from "../shared/condition-operator"
import { SelectableTable } from "../shared/selectable-table"
import { TagColumns, TagHeader, TagRow } from "../shared/tags"
import EditConditionFooter from "./edit-condition-footer"

const EditTagConditionSelector = ({ onClose }) => {
  const params = useQueryFilters(defaultQueryProps)
  const { conditions } = useDiscountForm()

  const [items, setItems] = useState(conditions.product_tags?.items || [])
  const [operator, setOperator] = useState<DiscountConditionOperator>(
    conditions.product_tags.operator
  )
  const { t } = useTranslation()

  const { isLoading, count, product_tags } = useAdminProductTags(
    params.queryObject,
    {
      keepPreviousData: true,
    }
  )

  const changed = (values: string[]) => {
    const selectedTags =
      product_tags?.filter((t) => values.includes(t.id)) || []

    setItems(selectedTags.map((t) => ({ id: t.id, label: t.value })))
  }

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
                searchPlaceholder: t("discount.search.tags"),
              }}
              resourceName="Tags"
              totalCount={count || 0}
              selectedIds={items.map((i) => i.id)}
              data={product_tags}
              columns={TagColumns}
              isLoading={isLoading}
              onChange={changed}
              renderRow={TagRow}
              renderHeaderGroup={TagHeader}
              {...params}
            />
          </>
        )}
      </Modal.Content>
      <Modal.Footer isLargeModal>
        <EditConditionFooter
          type="product_tags"
          items={items}
          operator={operator}
          onClose={onClose}
        />
      </Modal.Footer>
    </>
  )
}

export default EditTagConditionSelector
