import { Discount } from "@medusajs/medusa"
import { useAdminDiscount, useAdminDiscountRemoveCondition } from "medusa-react"
import React from "react"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import { ActionType } from "../../../../components/molecules/actionables"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { DiscountConditionType } from "../../types"
import { useTranslation } from "react-i18next"

export const useDiscountConditions = (discount: Discount) => {
  const { refetch } = useAdminDiscount(discount.id)
  const { mutate } = useAdminDiscountRemoveCondition(discount.id)
  const notification = useNotification()
  const { t } = useTranslation()
  const removeCondition = (conditionId: string) => {
    mutate(conditionId, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          t("discounts.conditions.delete_success"),
          "success"
        )
        refetch()
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  const itemized = discount.rule.conditions.map((condition) => ({
    type: condition.type,
    title: t("discounts.conditions." + getTitle(condition.type)),
    description: t("discounts.conditions." + getDescription(condition.type)),
    actions: [
      {
        label: t("discounts.condistions.delete"),
        icon: <TrashIcon size={16} />,
        variant: "danger",
        onClick: () => removeCondition(condition.id),
      },
    ] as ActionType[],
  }))

  return itemized
}

const getTitle = (type: DiscountConditionType) => {
  switch (type) {
    case DiscountConditionType.PRODUCTS:
      return "title_product"
    case DiscountConditionType.PRODUCT_COLLECTIONS:
      return "title_collection"
    case DiscountConditionType.PRODUCT_TAGS:
      return "title_tag"
    case DiscountConditionType.PRODUCT_TYPES:
      return "title_type"
    case DiscountConditionType.CUSTOMER_GROUPS:
      return "title_customer_groups"
  }
}

const getDescription = (type: DiscountConditionType) => {
  switch (type) {
    case DiscountConditionType.PRODUCTS:
      return "description_product"
    case DiscountConditionType.PRODUCT_COLLECTIONS:
      return "description_collections"
    case DiscountConditionType.PRODUCT_TAGS:
      return "description_tags"
    case DiscountConditionType.PRODUCT_TYPES:
      return "description_types"
    case DiscountConditionType.CUSTOMER_GROUPS:
      return "description_customer_groups"
  }
}
