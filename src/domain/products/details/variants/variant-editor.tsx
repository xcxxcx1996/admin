import { useAdminStore } from "medusa-react"
import React, { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import Checkbox from "../../../../components/atoms/checkbox"
import Button from "../../../../components/fundamentals/button"
import PlusIcon from "../../../../components/fundamentals/icons/plus-icon"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Input from "../../../../components/molecules/input"
import Modal from "../../../../components/molecules/modal"
import Select from "../../../../components/molecules/select"
import CurrencyInput from "../../../../components/organisms/currency-input"
import { convertEmptyStringToNull } from "../../../../utils/convert-empty-string-to-null"
import { countries as countryData } from "../../../../utils/countries"
import { focusByName } from "../../../../utils/focus-by-name"
import usePricesFieldArray from "../../product-form/form/usePricesFieldArray"
import { useTranslation } from "react-i18next"

const defaultVariant = {
  prices: [] as any,
  origin_country: "",
  options: [] as any,
}

const VariantEditor = ({
  variant = defaultVariant,
  onSubmit,
  onCancel,
  title,
  optionsMap,
}) => {
  const countryOptions = countryData.map((c) => ({
    label: c.name,
    value: c.alpha2.toLowerCase(),
  }))
  const { t } = useTranslation()
  const { store } = useAdminStore()
  const [selectedCountry, setSelectedCountry] = useState(() => {
    const defaultCountry = variant.origin_country
      ? countryOptions.find((cd) => cd.label === variant.origin_country)
      : null
    return defaultCountry || null
  })

  const { control, register, reset, watch, handleSubmit } = useForm({
    defaultValues: variant,
  })
  const {
    fields: prices,
    appendPrice,
    deletePrice,
    availableCurrencies,
  } = usePricesFieldArray(
    store?.currencies.map((c) => c.code) || [],
    {
      control,
      name: "prices",
      keyName: "indexId",
    },
    {
      defaultAmount: 1000,
      defaultCurrencyCode:
        store?.default_currency.code || store?.currencies[0].code || "usd",
    }
  )

  const { fields } = useFieldArray({
    control,
    name: "options",
    keyName: "indexId",
  })

  useEffect(() => {
    reset({
      ...variant,
      options: Object.values(optionsMap),
      prices: variant?.prices.map((p) => ({
        price: { ...p },
      })),
    })
  }, [variant, store])

  const handleSave = (data) => {
    if (!data.prices) {
      focusByName("add-price")
      return
    }

    if (!data.title) {
      data.title = data.options.map((o) => o.value).join(" / ")
    }

    data.prices = data.prices.map(({ price: { currency_code, amount } }) => ({
      currency_code,
      amount: Math.round(amount),
    }))
    data.options = data.options.map((option) => ({ ...option }))

    data.origin_country = selectedCountry?.label
    data.inventory_quantity = parseInt(data.inventory_quantity)
    data.weight = data?.weight ? parseInt(data.weight, 10) : undefined
    data.height = data?.height ? parseInt(data.height, 10) : undefined
    data.width = data?.width ? parseInt(data.width, 10) : undefined
    data.length = data?.length ? parseInt(data.length, 10) : undefined

    const cleaned = convertEmptyStringToNull(data)
    onSubmit(cleaned)
  }

  watch(["manage_inventory", "allow_backorder"])

  const variantTitle = variant?.options
    .map((opt) => opt?.value || "")
    .join(" / ")

  return (
    <Modal handleClose={onCancel}>
      <Modal.Body>
        <Modal.Header handleClose={onCancel}>
          <h2 className="inter-xlarge-semibold">
            {title}{" "}
            {variantTitle && (
              <span className="text-grey-50 inter-xlarge-regular">
                ({variantTitle})
              </span>
            )}
          </h2>
        </Modal.Header>
        <Modal.Content>
          <div className="mb-8">
            <label
              tabIndex={0}
              className="inter-base-semibold mb-4 flex items-center gap-xsmall"
            >
              {t("common.general")}
            </label>

            <div className="grid grid-cols-1 gap-y-small">
              <Input label={t("common.title")} name="title" ref={register} />
              {fields.map((field, index) => (
                <div key={field.indexId}>
                  <Input
                    ref={register({ required: true })}
                    name={`options[${index}].value`}
                    required={true}
                    label={field.title}
                    defaultValue={field.value}
                  />
                  <input
                    ref={register()}
                    type="hidden"
                    name={`options[${index}].option_id`}
                    defaultValue={field.option_id}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <label
              tabIndex={0}
              className="inter-base-semibold mb-4 flex items-center"
            >
              {t("products.prices.header")}
              <span className="text-rose-50 mr-xsmall">*</span>
              <IconTooltip content={t("products.prices.variant_price")} />
            </label>

            <div className="grid grid-cols-1 gap-y-xsmall">
              {prices.map((field, index) => (
                <div className="flex items-center" key={field.indexId}>
                  <div className="w-full">
                    <Controller
                      control={control}
                      key={field.indexId}
                      name={`prices[${index}].price`}
                      ref={register()}
                      defaultValue={field.price}
                      render={({ onChange, value }) => {
                        let codes = availableCurrencies
                        if (value?.currency_code) {
                          codes = [value?.currency_code, ...availableCurrencies]
                        }
                        codes.sort()
                        return (
                          <CurrencyInput
                            currencyCodes={codes}
                            currentCurrency={value?.currency_code}
                            size="medium"
                            readOnly={index === 0}
                            onChange={(code) =>
                              onChange({ ...value, currency_code: code })
                            }
                          >
                            <CurrencyInput.AmountInput
                              label={t("products.prices.amount")}
                              onChange={(amount) =>
                                onChange({ ...value, amount })
                              }
                              amount={value?.amount}
                            />
                          </CurrencyInput>
                        )
                      }}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="small"
                    className="ml-8 w-8 h-8 mr-2.5 text-grey-40 hover:text-grey-80 transition-colors"
                    onClick={deletePrice(index)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              className="mt-4"
              onClick={appendPrice}
              size="small"
              variant="ghost"
              name="add-price"
              disabled={availableCurrencies?.length === 0}
            >
              <PlusIcon size={20} />
              {t("products.prices.add")}
            </Button>
          </div>
          <div className="mb-8">
            <label className="inter-base-semibold flex items-center gap-xsmall">
              {t("products.stock.title")}
              <IconTooltip content={t("products.stock.tip")} />
            </label>
            <div className="w-full mt-4 grid medium:grid-cols-2 grid-cols-1 gap-y-base gap-x-xsmall">
              <Input
                label={t("products.stock.sku")}
                name="sku"
                placeholder={t("products.stock.sku")}
                ref={register}
              />
              <Input
                label={t("products.stock.ean")}
                name="ean"
                placeholder={t("products.stock.ean")}
                ref={register}
              />
              <Input
                label={t("products.stock.quantity")}
                name="inventory_quantity"
                placeholder="100"
                type="number"
                ref={register}
              />

              <Input
                label={t("products.stock.barcode")}
                name="barcode"
                placeholder={t("products.stock.barcode")}
                ref={register}
              />
            </div>

            <div className="flex items-center mt-6 gap-x-large">
              <div className="flex item-center gap-x-1.5">
                <Checkbox
                  name="manage_inventory"
                  label={t("products.stock.manage_inventory")}
                  ref={register}
                />
                <IconTooltip
                  content={
                    "When checked Medusa will regulate the inventory when orders and returns are made."
                  }
                />
              </div>
              <div className="flex item-center gap-x-1.5">
                <Checkbox
                  name="allow_backorder"
                  ref={register}
                  label={t("products.stock.allow_backorder")}
                />
                <IconTooltip
                  content={
                    "When checked the product will be available for purchase despite the product being sold out."
                  }
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="inter-base-semibold flex items-center gap-xsmall">
              {t("products.stock.dimensions")}{" "}
              <IconTooltip content={"Variant dimensions"} />
            </label>
            <div className="w-full mt-4 grid medium:grid-cols-2 grid-cols-1 gap-y-base gap-x-xsmall">
              <Input
                label={t("products.stock.height")}
                placeholder="Product Height"
                name="height"
                ref={register}
              />
              <Input
                label={t("products.stock.width")}
                placeholder="Product Width"
                name="width"
                ref={register}
              />
              <Input
                label={t("products.stock.length")}
                name="length"
                placeholder="Product Length"
                ref={register}
              />
              <Input
                label={t("products.stock.weight")}
                name="weight"
                placeholder="Product Weight"
                ref={register}
              />
            </div>
          </div>
          <div className="mb-8">
            <label className="inter-base-semibold flex items-center gap-xsmall">
              Customs <IconTooltip content={"Variant customs information"} />
            </label>
            <div className="w-full grid mt-4 medium:grid-cols-2 grid-cols-1 gap-y-base gap-x-xsmall">
              <Input
                label={t("products.stock.mid_code")}
                placeholder={t("products.stock.mid_code")}
                name="mid_code"
                ref={register}
              />
              <Input
                label={t("products.stock.hs_code")}
                placeholder={t("products.stock.hs_code")}
                name="hs_code"
                ref={register}
              />
              <Select
                enableSearch
                label={t("products.stock.country_origin")}
                options={countryOptions}
                value={selectedCountry}
                onChange={setSelectedCountry}
              />
              <Input
                label={t("products.stock.material")}
                name="material"
                placeholder={t("products.stock.material")}
                ref={register}
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full justify-end gap-x-base">
            <Button
              className="w-[127px]"
              onClick={onCancel}
              size="small"
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(handleSave)}
              type="submit"
              className="w-[127px]"
              size="small"
              variant="primary"
            >
              Save
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default VariantEditor
