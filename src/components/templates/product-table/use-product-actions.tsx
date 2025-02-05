import { navigate } from "gatsby"
import { useAdminDeleteProduct, useAdminUpdateProduct } from "medusa-react"
import * as React from "react"
import useImperativeDialog from "../../../hooks/use-imperative-dialog"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"
import DuplicateIcon from "../../fundamentals/icons/duplicate-icon"
import EditIcon from "../../fundamentals/icons/edit-icon"
import PublishIcon from "../../fundamentals/icons/publish-icon"
import TrashIcon from "../../fundamentals/icons/trash-icon"
import UnpublishIcon from "../../fundamentals/icons/unpublish-icon"
import { ActionType } from "../../molecules/actionables"
import useCopyProduct from "./use-copy-product"
import { useTranslation } from "react-i18next"

const useProductActions = (product) => {
  const notification = useNotification()
  const dialog = useImperativeDialog()
  const copyProduct = useCopyProduct()
  const deleteProduct = useAdminDeleteProduct(product?.id)
  const updateProduct = useAdminUpdateProduct(product?.id)
  const { t } = useTranslation()
  const handleDelete = async () => {
    const shouldDelete = await dialog({
      heading: "Delete Product",
      text: "Are you sure you want to delete this product?",
    })

    if (shouldDelete) {
      deleteProduct.mutate()
    }
  }

  const getActions = (): ActionType[] => [
    {
      label: t("common.edit"),
      onClick: () => navigate(`/a/products/${product.id}`),
      icon: <EditIcon size={20} />,
    },
    {
      label:
        product.status === "published"
          ? t("common.unpublish")
          : t("common.publish"),
      onClick: () => {
        const newStatus = product.status === "published" ? "draft" : "published"
        updateProduct.mutate(
          {
            status: newStatus,
          },
          {
            onSuccess: () => {
              notification(
                t("common.status.success"),
                `Successfully ${
                  product.status === "published" ? "unpublished" : "published"
                } product`,
                "success"
              )
            },
            onError: (err) =>
              notification(t("common.status.error"), getErrorMessage(err), "error"),
          }
        )
      },
      icon:
        product.status === "published" ? (
          <UnpublishIcon size={20} />
        ) : (
          <PublishIcon size={20} />
        ),
    },
    {
      label: t("common.duplicate"),
      onClick: () => copyProduct(product),
      icon: <DuplicateIcon size={20} />,
    },
    {
      label: t("common.delete"),
      variant: "danger",
      onClick: handleDelete,
      icon: <TrashIcon size={20} />,
    },
  ]

  return {
    getActions,
  }
}

export default useProductActions
