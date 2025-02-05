import { navigate } from "gatsby"
import { useAdminDeleteCollection } from "medusa-react"
import * as React from "react"
import useImperativeDialog from "../../../hooks/use-imperative-dialog"
import EditIcon from "../../fundamentals/icons/edit-icon"
import TrashIcon from "../../fundamentals/icons/trash-icon"
import { ActionType } from "../../molecules/actionables"
import { useTranslation } from "react-i18next"

const useCollectionActions = (collection) => {
  const dialog = useImperativeDialog()
  const deleteCollection = useAdminDeleteCollection(collection?.id)
  const { t } = useTranslation()
  const handleDelete = async () => {
    const shouldDelete = await dialog({
      heading: "Delete Collection",
      text: "Are you sure you want to delete this collection?",
    })

    if (shouldDelete) {
      deleteCollection.mutate()
    }
  }

  const getActions = (coll): ActionType[] => [
    {
      label: t("common.edit"),
      onClick: () => navigate(`/a/collections/${coll.id}`),
      icon: <EditIcon size={20} />,
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

export default useCollectionActions
