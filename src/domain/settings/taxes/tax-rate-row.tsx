import React from "react"
import { useAdminDeleteTaxRate } from "medusa-react"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import Table from "../../../components/molecules/table"
import EditIcon from "../../../components/fundamentals/icons/edit-icon"
import useImperativeDialog from "../../../hooks/use-imperative-dialog"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"
import { TaxRateType } from "../../../types/shared"
import { useTranslation } from "react-i18next"

type TaxRate = {
  id: string
  name?: string
  rate: number | null
  code: string | null
  type: TaxRateType
}

export const TaxRateRow = ({ row, onEdit }) => {
  const dialog = useImperativeDialog()
  const notification = useNotification()
  const deleteTaxRate = useAdminDeleteTaxRate(row.original.id)
  const { t } = useTranslation()
  const handleDelete = async (rate: TaxRate) => {
    if (!rate || rate.type !== TaxRateType.RATE) {
      return Promise.resolve()
    }

    const shouldDelete = await dialog({
      heading: t("settings.tax.delete_rate_heading"),
      text: t("settings.tax.delete_rate_text"),
    })

    if (!shouldDelete) {
      return
    }

    return deleteTaxRate
      .mutateAsync()
      .then(() => {
        notification(
          t("common.status.success"),
          t("settings.tax.delete_success"),
          "success"
        )
      })
      .catch((err) => {
        notification(t("common.status.error"), getErrorMessage(err), "error")
      })
  }

  const actions = [
    {
      label: t("common.edit"),
      onClick: () => onEdit(row.original),
      icon: <EditIcon size={20} />,
    },
  ]

  if (row.original.type === TaxRateType.RATE) {
    actions.push({
      label: t("settings.tax.delete_rate_heading"),
      variant: "danger",
      onClick: () => handleDelete(row.original),
      icon: <TrashIcon size={20} />,
    })
  }

  return (
    <Table.Row
      color={"inherit"}
      forceDropdown
      actions={actions}
      {...row.getRowProps()}
      className="group"
    >
      {row.cells.map((cell, index) => {
        return cell.render("Cell", { index })
      })}
    </Table.Row>
  )
}
