import { Discount } from "@medusajs/medusa"
import { parse } from "iso8601-duration"
import { useAdminUpdateDiscount } from "medusa-react"
import moment from "moment"
import React, { ReactNode } from "react"
import ClockIcon from "../../../../components/fundamentals/icons/clock-icon"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import { ActionType } from "../../../../components/molecules/actionables"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { removeNullish } from "../../../../utils/remove-nullish"
import { useTranslation } from "react-i18next"

type displaySetting = {
  title: string
  description: ReactNode
  actions?: ActionType[]
}

const DisplaySettingsDateDescription = ({ date }: { date: Date }) => (
  <div className="flex text-grey-50 inter-small-regular ">
    {moment.utc(date).format("ddd, DD MMM YYYY")}
    <span className="flex items-center ml-3">
      <ClockIcon size={16} />
      <span className="ml-2.5">{moment.utc(date).format("UTC HH:mm")}</span>
    </span>
  </div>
)

const CommonDescription = ({ text }) => (
  <span className="text-grey-50 inter-small-regular">{text}</span>
)

const useDiscountConfigurations = (discount: Discount) => {
  const updateDiscount = useAdminUpdateDiscount(discount.id)
  const notification = useNotification()
  const { t } = useTranslation()
  const conditions: displaySetting[] = []

  conditions.push({
    title: t("discounts.configurations.start_date_label"),
    description: <DisplaySettingsDateDescription date={discount.starts_at} />,
  })

  if (discount.ends_at) {
    conditions.push({
      title: t("discounts.configurations.expire_date_label"),
      description: <DisplaySettingsDateDescription date={discount.ends_at} />,
      actions: [
        {
          label: t("discounts.configurations.delete"),
          icon: <TrashIcon size={20} />,
          variant: "danger",
          onClick: async () =>
            await updateDiscount.mutateAsync(
              { ends_at: null },
              {
                onSuccess: () => {
                  notification(
                    t("common.status.success"),
                    "Discount end date removed",
                    "success"
                  )
                },
                onError: (error) => {
                  notification(t("common.status.error"), getErrorMessage(error), "error")
                },
              }
            ),
        },
      ],
    })
  }
  if (discount.usage_limit) {
    conditions.push({
      title: t("discounts.configurations.redemption_number"),
      description: (
        <CommonDescription text={discount.usage_limit.toLocaleString("en")} />
      ),
      actions: [
        {
          label: t("discounts.configurations.delete"),
          icon: <TrashIcon size={20} />,
          variant: "danger",
          onClick: async () =>
            await updateDiscount.mutateAsync(
              { usage_limit: null },
              {
                onSuccess: () => {
                  notification(
                    t("common.status.success"),
                    t("discounts.configurations.success_remove_redemption"),
                    "success"
                  )
                },
                onError: (error) => {
                  notification(t("common.status.error"), getErrorMessage(error), "error")
                },
              }
            ),
        },
      ],
    })
  }
  if (discount.valid_duration) {
    conditions.push({
      title: "Duration",
      description: (
        <CommonDescription
          text={Object.entries(removeNullish(parse(discount.valid_duration)))
            .map(([key, value]) => `${value} ${key}`)
            .join(", ")}
        />
      ),
      actions: [
        {
          label: t("discounts.configurations.delete_setting"),
          icon: <TrashIcon size={20} />,
          variant: "danger",
          onClick: async () =>
            await updateDiscount.mutateAsync(
              { valid_duration: null },
              {
                onSuccess: () => {
                  notification(
                    t("common.status.success"),
                    t("discounts.configurations.success_remove_duration"),
                    "success"
                  )
                },
                onError: (error) => {
                  notification(t("common.status.error"), getErrorMessage(error), "error")
                },
              }
            ),
        },
      ],
    })
  }

  return conditions
}

export default useDiscountConfigurations
