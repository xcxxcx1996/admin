import React from "react"
import { useTranslation } from "react-i18next"
import Button from "../../../../../../components/fundamentals/button"
import { DiscountConditionOperator } from "../../../../types"
import { useDiscountForm } from "../../form/discount-form-context"

type EditConditionFooterProps = {
  onClose: () => void
  type:
    | "products"
    | "product_collections"
    | "product_types"
    | "product_tags"
    | "customer_groups"
  items: { id: string; label: string }[]
  operator: DiscountConditionOperator
}

const EditConditionFooter: React.FC<EditConditionFooterProps> = ({
  type,
  items,
  operator,
  onClose,
}) => {
  const { t } = useTranslation()

  const { updateCondition } = useDiscountForm()
  return (
    <div className="flex items-center justify-end w-full gap-x-xsmall">
      <Button variant="secondary" size="small" onClick={onClose}>
        {t("common.cancel")}
      </Button>
      <Button
        variant="danger"
        size="small"
        onClick={() => {
          updateCondition({
            type,
            items: [],
            operator: DiscountConditionOperator.IN,
          })
          onClose()
        }}
      >
        Delete condition
      </Button>
      <Button
        variant="primary"
        size="small"
        onClick={() => {
          updateCondition({
            type,
            items,
            operator,
          })
          onClose()
        }}
        className="min-w-[128px]"
      >
        {t("common.save")}
      </Button>
    </div>
  )
}

export default EditConditionFooter
