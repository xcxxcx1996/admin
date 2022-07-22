import { useParams } from "@reach/router"
import { navigate } from "gatsby"
import {
  useAdminCollections,
  useAdminDeleteProduct,
  useAdminProductTypes,
  useAdminUpdateProduct,
} from "medusa-react"
import React from "react"
import { Controller } from "react-hook-form"
import Checkbox from "../../../../components/atoms/checkbox"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Input from "../../../../components/molecules/input"
import Select from "../../../../components/molecules/select"
import StatusSelector from "../../../../components/molecules/status-selector"
import TagInput from "../../../../components/molecules/tag-input"
import Textarea from "../../../../components/molecules/textarea"
import BodyCard from "../../../../components/organisms/body-card"
import RadioGroup from "../../../../components/organisms/radio-group"
import useImperativeDialog from "../../../../hooks/use-imperative-dialog"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"
import {
  SINGLE_PRODUCT_VIEW,
  useProductForm,
  VARIANTS_VIEW,
} from "../form/product-form-context"

const General = ({ showViewOptions = true, isEdit = false, product }) => {
  const {
    register,
    control,
    setViewType,
    viewType,
    setValue,
  } = useProductForm()
  const { product_types } = useAdminProductTypes(undefined, { cacheTime: 0 })
  const { collections } = useAdminCollections()
  const { t } = useTranslation()
  const typeOptions =
    product_types?.map((tag) => ({ label: tag.value, value: tag.id })) || []
  const collectionOptions =
    collections?.map((collection) => ({
      label: collection.title,
      value: collection.id,
    })) || []

  const setNewType = (value: string) => {
    const newType = {
      label: value,
      value,
    }

    typeOptions.push(newType)
    setValue("type", newType)

    return newType
  }

  return (
    <GeneralBodyCard
      isEdit={isEdit}
      product={product}
      title={t("common.general")}
      subtitle={t("products.tip")}
    >
      <div className="mt-large">
        <h6 className="inter-base-semibold mb-1">{t("common.detail")}</h6>
        <label
          htmlFor="name"
          className="inter-small-regular text-grey-50 block max-w-[370px] mb-base"
        >
          给你的产品起一个简短而清晰的名字。50-60个字符。
        </label>
        <div className="flex gap-8 mb-base">
          <Input
            id="name"
            label={t("common.general")}
            name="title"
            placeholder="Jacket, Sunglasses..."
            required
            ref={register({
              required: "Name is required",
              minLength: 1,
              pattern: /(.|\s)*\S(.|\s)*/,
            })}
          />
          <Input
            tooltipContent="Handles are human friendly unique identifiers that are appropriate for URL slugs."
            label={t("products.handle")}
            name="handle"
            placeholder="bathrobe"
            prefix="/"
            ref={register()}
          />
        </div>
        <label
          className="inter-small-regular text-grey-50 block max-w-[370px] mb-base"
          htmlFor="description"
        >
          给你的产品一个简短而清晰的描述。120-160个字符
        </label>
        <div className="grid grid-rows-3 grid-cols-2 gap-x-8 gap-y-4 mb-large">
          <Textarea
            name="description"
            id="description"
            label={t("common.description")}
            placeholder="Short description of the product..."
            className="row-span-full"
            rows={8}
            ref={register}
          />
          <Controller
            as={Select}
            control={control}
            label={t("products.collection")}
            name="collection"
            placeholder="Select collection..."
            options={collectionOptions}
            clearSelected
          />
          <Controller
            control={control}
            name="type"
            render={({ value, onChange }) => {
              return (
                <Select
                  label={t("products.type")}
                  placeholder="Select type..."
                  options={typeOptions}
                  onChange={onChange}
                  value={value}
                  isCreatable
                  onCreateOption={(value) => {
                    return setNewType(value)
                  }}
                  clearSelected
                />
              )
            }}
          />
          <Controller
            name="tags"
            render={({ onChange, value }) => {
              return (
                <TagInput
                  label={t("products.tags")}
                  placeholder="Spring, Summer..."
                  onChange={onChange}
                  values={value || []}
                />
              )
            }}
            control={control}
          />
        </div>
        <div className="flex item-center gap-x-1.5 mb-xlarge">
          <Checkbox
            name="discountable"
            ref={register}
            label={t("products.discountable")}
          />
          <IconTooltip
            content={
              "When unchecked discounts will not be applied to this product"
            }
          />
        </div>
        {showViewOptions && (
          <RadioGroup.Root
            value={viewType}
            onValueChange={setViewType}
            className="flex items-center gap-4 mt-xlarge"
          >
            <RadioGroup.SimpleItem
              label={t("products.simple_product")}
              value={SINGLE_PRODUCT_VIEW}
            />
            <RadioGroup.SimpleItem
              label={t("products.variant_product")}
              value={VARIANTS_VIEW}
            />
          </RadioGroup.Root>
        )}
      </div>
    </GeneralBodyCard>
  )
}

const GeneralBodyCard = ({ isEdit, product, ...props }) => {
  const params = useParams()
  const dialog = useImperativeDialog()
  const notification = useNotification()
  const updateProduct = useAdminUpdateProduct(params?.id)
  const deleteProduct = useAdminDeleteProduct(params?.id)
  const { t } = useTranslation()

  const onDelete = async () => {
    const shouldDelete = await dialog({
      heading: t("products.delete_heading"),
      text: t("products.delete_text"),
    })
    if (shouldDelete) {
      deleteProduct.mutate(undefined, {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("products.delete_success"),
            "success"
          )
          navigate("/a/products/")
        },
        onError: (err) => {
          notification(t("common.status.error"), getErrorMessage(err), "error")
        },
      })
    }
  }

  const onStatusChange = async () => {
    const newStatus =
      product?.status === "published"
        ? t("common.status.draft")
        : t("common.status.success")
    updateProduct.mutate(
      {
        status: newStatus,
      },
      {
        onSuccess: () => {
          const pastTense =
            newStatus === "published"
              ? t("common.status.success")
              : t("common.status.draft")
          notification(
            t("common.status.success"),
            `${t("common.status.product")} ${pastTense} ${t(
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

  const actionables = [
    {
      label: t("products.delete_product"),
      onClick: onDelete,
      variant: "danger" as const,
      icon: <TrashIcon />,
    },
  ]

  return (
    <BodyCard
      actionables={isEdit ? actionables : undefined}
      forceDropdown
      status={
        isEdit ? (
          <StatusSelector
            isDraft={product?.status === "draft"}
            activeState={t("common.status.published")}
            draftState={t("common.status.drafted")}
            onChange={onStatusChange}
          />
        ) : undefined
      }
      {...props}
    />
  )
}

export default General
