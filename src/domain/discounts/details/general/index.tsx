import { Discount } from "@medusajs/medusa"
import { navigate } from "gatsby"
import { useAdminDeleteDiscount, useAdminUpdateDiscount } from "medusa-react"
import React, { useState } from "react"
import Badge from "../../../../components/fundamentals/badge"
import EditIcon from "../../../../components/fundamentals/icons/edit-icon"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import { ActionType } from "../../../../components/molecules/actionables"
import StatusSelector from "../../../../components/molecules/status-selector"
import BodyCard from "../../../../components/organisms/body-card"
import useImperativeDialog from "../../../../hooks/use-imperative-dialog"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { formatAmountWithSymbol } from "../../../../utils/prices"
import EditGeneral from "./edit-general"
import { useTranslation } from "react-i18next"

type GeneralProps = {
  discount: Discount
}

const General: React.FC<GeneralProps> = ({ discount }) => {
  const dialog = useImperativeDialog()
  const notification = useNotification()
  const updateDiscount = useAdminUpdateDiscount(discount.id)
  const deletediscount = useAdminDeleteDiscount(discount.id)
  const [showmModal, setShowModal] = useState(false)
  const { t } = useTranslation()
  const onDelete = async () => {
    const shouldDelete = await dialog({
      heading: t("discounts.delete_promotion_header"),
      text: t("discounts.delete_promotion_text"),
    })
    if (shouldDelete) {
      deletediscount.mutate(undefined, {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("discounts.delete_promotion_success"),
            "success"
          )
          navigate("/a/discounts/")
        },
        onError: (err) => {
          notification(t("common.status.error"), getErrorMessage(err), "error")
        },
      })
    }
  }

  const onStatusChange = async () => {
    updateDiscount.mutate(
      {
        is_disabled: !discount.is_disabled,
      },
      {
        onSuccess: () => {
          const pastTense = !discount.is_disabled
            ? t("common.status.published")
            : t("common.status.drafted")
          notification(
            t("common.status.success"),
            `${t("discounts.title")} ${pastTense} ${t(
              "common.status.successfully"
            )}`,
            "success"
          )
        },
        onError: (err) => {
          notification(t("common.status.error"), getErrorMessage(err), "error")
        },
      }
    )
  }

  const actionables: ActionType[] = [
    {
      label: t("discounts.edit_general"),
      onClick: () => setShowModal(true),
      icon: <EditIcon size={20} />,
    },
    {
      label: t("discounts.delete"),
      onClick: onDelete,
      variant: "danger",
      icon: <TrashIcon size={20} />,
    },
  ]

  return (
    <>
      <BodyCard
        actionables={actionables}
        title={discount.code}
        subtitle={discount.rule.description}
        forceDropdown
        className="min-h-[200px]"
        status={
          <div className="flex items-center gap-x-2xsmall">
            {discount.is_dynamic && (
              <span>
                <Badge variant="default">
                  <span className="text-grey-90 inter-small-regular">
                    {t("discounts.template")}
                  </span>
                </Badge>
              </span>
            )}
            <StatusSelector
              isDraft={discount?.is_disabled}
              activeState={t("common.publish")}
              draftState={t("common.draft")}
              onChange={onStatusChange}
            />
          </div>
        }
      >
        <div className="flex">
          <div className="border-l border-grey-20 pl-6">
            {getPromotionDescription(discount)}
            <span className="inter-small-regular text-grey-50">
              {t("discounts.amount")}
            </span>
          </div>
          <div className="border-l border-grey-20 pl-6 ml-12">
            <h2 className="inter-xlarge-regular text-grey-90">
              {discount.regions.length.toLocaleString("en-US")}
            </h2>
            <span className="inter-small-regular text-grey-50">
              {t("discounts.regions")}
            </span>
          </div>
          <div className="border-l border-grey-20 pl-6 ml-12">
            <h2 className="inter-xlarge-regular text-grey-90">
              {discount.usage_count.toLocaleString("en-US")}
            </h2>
            <span className="inter-small-regular text-grey-50">
              {t("discounts.total_redemptions")}
            </span>
          </div>
        </div>
      </BodyCard>
      {showmModal && (
        <EditGeneral discount={discount} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}

const getPromotionDescription = (discount: Discount) => {
  const { t } = useTranslation()
  switch (discount.rule.type) {
    case "fixed":
      return (
        <div className="flex items-baseline">
          <h2 className="inter-xlarge-regular">
            {formatAmountWithSymbol({
              currency: discount.regions[0].currency_code,
              amount: discount.rule.value,
            })}
          </h2>
          <span className="inter-base-regular text-grey-50 ml-1">
            {discount.regions[0].currency_code.toUpperCase()}
          </span>
        </div>
      )
    case "percentage":
      return (
        <div className="flex items-baseline">
          <h2 className="inter-xlarge-regular text-grey-90">
            {discount.rule.value}
          </h2>
          <span className="inter-base-regular text-grey-50 ml-1">%</span>
        </div>
      )
    case "free_shipping":
      return (
        <h2 className="inter-xlarge-regular text-grey-90">{`FREE SHIPPING`}</h2>
      )
    default:
      return t("discounts.unknown")
  }
}

export default General
