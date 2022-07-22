import React from "react"
import { navigate } from "gatsby"
import { useAdminDeleteDiscount, useAdminUpdateDiscount } from "medusa-react"
import useImperativeDialog from "../../../hooks/use-imperative-dialog"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"
import DuplicateIcon from "../../fundamentals/icons/duplicate-icon"
import PublishIcon from "../../fundamentals/icons/publish-icon"
import TrashIcon from "../../fundamentals/icons/trash-icon"
import UnpublishIcon from "../../fundamentals/icons/unpublish-icon"
import EditIcon from "../../fundamentals/icons/edit-icon"
import useCopyPromotion from "./use-copy-promotion"
import { useTranslation } from "react-i18next"

const usePromotionActions = (promotion) => {
  const notification = useNotification()
  const dialog = useImperativeDialog()

  const copyPromotion = useCopyPromotion()

  const updatePromotion = useAdminUpdateDiscount(promotion.id)
  const deletePromotion = useAdminDeleteDiscount(promotion?.id)
  const { t } = useTranslation()
  const handleDelete = async () => {
    const shouldDelete = await dialog({
      heading: "Delete Discount",
      text: "Are you sure you want to delete this Discount?",
    })

    if (shouldDelete) {
      deletePromotion.mutate()
    }
  }

  const getRowActions = () => {
    return [
      {
        label: t("common.edit"),
        icon: <EditIcon size={20} />,
        onClick: () => navigate(`/a/discounts/${promotion.id}`),
      },
      {
        label: promotion.is_disabled ? t("common.publish") : t("common.unpublish"),
        icon: promotion.is_disabled ? (
          <PublishIcon size={20} />
        ) : (
          <UnpublishIcon size={20} />
        ),
        onClick: () => {
          updatePromotion.mutate(
            {
              is_disabled: !promotion.is_disabled,
            },
            {
              onSuccess: () => {
                notification(
                  t("common.status.success"),
                  `Successfully ${
                    promotion.is_disabled ? "published" : "unpublished"
                  } discount`,
                  "success"
                )
              },
              onError: (err) =>
                notification(t("common.status.error"), getErrorMessage(err), "error"),
            }
          )
        },
      },
      {
        label: t("common.duplicate"),
        icon: <DuplicateIcon size={20} />,
        onClick: () => copyPromotion(promotion),
      },
      {
        label: t("common.delete"),
        icon: <TrashIcon size={20} />,
        variant: "danger",
        onClick: handleDelete,
      },
    ]
  }

  return { getRowActions }
}

export default usePromotionActions
