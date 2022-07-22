import {
  useAdminCreateVariant,
  useAdminDeleteVariant,
  useAdminUpdateVariant,
} from "medusa-react"
import React, { useState } from "react"
import VariantEditor from "../../domain/products/details/variants/variant-editor"
import { buildOptionsMap } from "../../domain/products/product-form/utils"
import useImperativeDialog from "../../hooks/use-imperative-dialog"
import useNotification from "../../hooks/use-notification"
import { getErrorMessage } from "../../utils/error-messages"
import DuplicateIcon from "../fundamentals/icons/duplicate-icon"
import EditIcon from "../fundamentals/icons/edit-icon"
import TrashIcon from "../fundamentals/icons/trash-icon"
import GridInput from "../molecules/grid-input"
import Table from "../molecules/table"
import { useGridColumns } from "./use-grid-columns"
import { useTranslation } from "react-i18next"

const VariantGrid = ({ product, variants, edit, onVariantsChange }) => {
  const [isDuplicate, setIsDuplicate] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<{
    prices: any[]
    origin_country: string
    options: any[]
    [k: string]: any
  } | null>(null)
  const { t } = useTranslation()
  const createVariant = useAdminCreateVariant(product?.id)
  const updateVariant = useAdminUpdateVariant(product?.id)
  const deleteVariant = useAdminDeleteVariant(product?.id)

  const notification = useNotification()
  const dialog = useImperativeDialog()

  const columns = useGridColumns(product, edit)

  const handleChange = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    }

    onVariantsChange(newVariants)
  }

  const getDisplayValue = (variant, column) => {
    const { formatter, field } = column
    return formatter ? formatter(variant[field]) : variant[field]
  }

  const handleUpdateVariant = (data) => {
    updateVariant.mutate(
      { variant_id: selectedVariant?.id, ...data },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("products.variant.update_success"),
            "success"
          )
          setSelectedVariant(null)
        },
        onError: (err) => {
          notification(t("common.status.error"), getErrorMessage(err), "error")
        },
      }
    )
  }

  const handleDeleteVariant = async (variant) => {
    const shouldDelete = await dialog({
      heading: t("products.variant.delete_heading"),
      text: t("products.variant.delete_text"),
    })

    if (shouldDelete) {
      return deleteVariant.mutate(variant.id)
    }
  }

  const handleDuplicateVariant = async (variant) => {
    createVariant.mutate(
      { ...variant },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("products.variant.create_success"),
            "success"
          )
          setSelectedVariant(null)
        },
        onError: (err) => {
          notification(t("common.status.error"), getErrorMessage(err), "error")
        },
      }
    )
  }

  const editVariantActions = (variant) => {
    return [
      {
        label: t("common.edit"),
        icon: <EditIcon size={20} />,
        onClick: () => setSelectedVariant(variant),
      },
      {
        label: t("common.duplicate"),
        icon: <DuplicateIcon size={20} />,
        onClick: () => {
          setSelectedVariant(variant)
          setIsDuplicate(true)
        },
      },
      {
        label: t("common.delete"),
        icon: <TrashIcon size={20} />,
        onClick: () => handleDeleteVariant(variant),
        variant: "danger",
      },
    ]
  }

  return (
    <>
      <Table>
        <Table.Head>
          <Table.HeadRow>
            {columns.map((col) => (
              <Table.HeadCell className="w-[100px] px-2 py-4">
                {col.header}
              </Table.HeadCell>
            ))}
          </Table.HeadRow>
        </Table.Head>
        <Table.Body>
          {variants.map((variant, i) => {
            return (
              <Table.Row
                key={i}
                color={"inherit"}
                actions={edit && editVariantActions(variant)}
              >
                {columns.map((col, j) => {
                  return (
                    <Table.Cell key={j}>
                      {edit || col.readOnly ? (
                        <div className="px-2 py-4 truncate">
                          {getDisplayValue(variant, col)}
                        </div>
                      ) : (
                        <GridInput
                          key={j}
                          value={variant[col.field]}
                          onChange={({ currentTarget }) =>
                            handleChange(i, col.field, currentTarget.value)
                          }
                        />
                      )}
                    </Table.Cell>
                  )
                })}
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table>
      {selectedVariant && (
        <VariantEditor
          variant={selectedVariant}
          onCancel={() => setSelectedVariant(null)}
          onSubmit={isDuplicate ? handleDuplicateVariant : handleUpdateVariant}
          optionsMap={buildOptionsMap(product, selectedVariant)}
          title="Edit variant"
        />
      )}
    </>
  )
}

export default VariantGrid
