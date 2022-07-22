import clsx from "clsx"
import React from "react"
import { Controller, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import RadioGroup from "../../../../../components/organisms/radio-group"
import { DiscountRuleType } from "../../../types"
import { useDiscountForm } from "../form/discount-form-context"

const PromotionType = () => {
  const { control } = useDiscountForm()
  const { t } = useTranslation()

  const regions = useWatch({
    control,
    name: "regions",
  })

  return (
    <Controller
      name="rule.type"
      control={control}
      rules={{ required: true }}
      render={({ onChange, value }) => {
        return (
          <RadioGroup.Root
            value={value}
            onValueChange={onChange}
            className={clsx("flex items-center gap-base mt-base px-1")}
          >
            <RadioGroup.Item
              value={DiscountRuleType.PERCENTAGE}
              className="flex-1"
              label={t("discounts.promotion.percentage")}
              description={t("discounts.promotion.percentage_description")}
            />
            <RadioGroup.Item
              value={DiscountRuleType.FIXED}
              className="flex-1"
              label={t("discounts.promotion.amount")}
              description={t("discounts.promotion.amount_description")}
              disabled={Array.isArray(regions) && regions.length > 1}
              disabledTooltip="You can only select one valid region if you want to use the fixed amount type"
            />
            <RadioGroup.Item
              value={DiscountRuleType.FREE_SHIPPING}
              className="flex-1"
              label={t("discounts.promotion.free_shipping")}
              description={t("discounts.promotion.free_shipping_description")}
            />
          </RadioGroup.Root>
        )
      }}
    />
  )
}

export default PromotionType
