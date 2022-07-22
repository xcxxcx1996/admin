import * as React from "react"
import { useAdminDeletePriceList, useAdminUpdatePriceList } from "medusa-react"
import useImperativeDialog from "../../../hooks/use-imperative-dialog"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"
import TrashIcon from "../../fundamentals/icons/trash-icon"
import UnpublishIcon from "../../fundamentals/icons/unpublish-icon"
import { ActionType } from "../../molecules/actionables"
import { isActive } from "./utils"
import PublishIcon from "../../fundamentals/icons/publish-icon"
import { useTranslation } from "react-i18next"

const usePriceListActions = (priceList) => {
  const dialog = useImperativeDialog()
  const notification = useNotification()
  const updatePrice = useAdminUpdatePriceList(priceList?.id)
  const deletePrice = useAdminDeletePriceList(priceList?.id)
  const { t } = useTranslation()
  const onDelete = async () => {
    const shouldDelete = await dialog({
      heading: "Delete Price List",
      text: "Are you sure you want to delete this price list?",
    })
    if (shouldDelete) {
      deletePrice.mutate(undefined, {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            "Successfully deleted the price list",
            "success"
          )
        },
        onError: (err) => notification(t("common.status.error"), getErrorMessage(err), "error"),
      })
    }
  }

  const onUpdate = () => {
    updatePrice.mutate(
      {
        status: isActive(priceList) ? "draft" : "active",
      },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            `Successfully ${
              isActive(priceList) ? "unpublished" : "published"
            } price list`,
            "success"
          )
        },
      }
    )
  }

  const getActions = (): ActionType[] => [
    {
      label: isActive(priceList) ? t("common.unpublish") : t("common.publish"),
      onClick: onUpdate,
      icon: isActive(priceList) ? (
        <UnpublishIcon size={20} />
      ) : (
        <PublishIcon size={20} />
      ),
    },
    {
      label: t("common.delete"),
      onClick: onDelete,
      icon: <TrashIcon size={20} />,
      variant: "danger",
    },
  ]

  return {
    getActions,
  }
}

export default usePriceListActions
