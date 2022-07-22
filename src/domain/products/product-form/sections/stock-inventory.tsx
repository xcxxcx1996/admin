import React from "react"
import { Controller } from "react-hook-form"
import Checkbox from "../../../../components/atoms/checkbox"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Input from "../../../../components/molecules/input"
import Select from "../../../../components/molecules/select"
import BodyCard from "../../../../components/organisms/body-card"
import { countries as countryData } from "../../../../utils/countries"
import { numberOrNull } from "../../../../utils/form-helpers"
import { useProductForm } from "../form/product-form-context"
import { useTranslation } from "react-i18next"

const StockAndInventory = () => {
  const { isVariantsView, register, control } = useProductForm()
  const countryOptions = countryData.map((c) => ({
    label: c.name,
    value: c.name,
  }))
  const { t } = useTranslation()
  return (
    <BodyCard
      title={t("products.stock.title")}
      subtitle={t("products.tip")}
    >
      <div className="mt-large">
        {!isVariantsView && (
          <>
            <div className="flex items-center mb-base">
              <h6 className="inter-base-semibold text-grey-90 mr-1.5">
                {t("common.general")}
              </h6>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-large">
              <Input
                label={t("products.stock.title")}
                name="sku"
                placeholder="SUN-G, JK1234..."
                ref={register}
              />
              <Input
                label={t("products.stock.title")}
                name="ean"
                placeholder="1231231231234..."
                ref={register}
              />
              <Input
                label={t("products.stock.quantity")}
                name="inventory_quantity"
                type="number"
                placeholder="100"
                ref={register({ setValueAs: numberOrNull })}
              />
              <Input
                label={t("products.stock.material")}
                name="material"
                ref={register}
                placeholder="Wool..."
              />
            </div>
          </>
        )}
        {!isVariantsView && (
          <div className="flex items-center gap-4 mb-xlarge">
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
                label={t("products.stock.allow_backorders")}
              />
              <IconTooltip
                content={
                  "When checked the product will be available for purchase despite the product being sold out."
                }
              />
            </div>
          </div>
        )}
        <div className="flex items-center mb-base">
          <h6 className="inter-base-semibold text-grey-90 mr-1.5">
            {t("products.stock.dimensions")}
          </h6>
        </div>
        <div className="flex gap-x-8">
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-4 mb-large">
            <Input
              type="number"
              label={t("products.stock.height")}
              name="height"
              ref={register({ setValueAs: numberOrNull })}
              min={0}
              placeholder="100..."
            />
            <Input
              type="number"
              label={t("products.stock.width")}
              name="width"
              ref={register({ setValueAs: numberOrNull })}
              placeholder="100..."
              min={0}
            />
            <Input
              type="number"
              label={t("products.stock.length")}
              name="length"
              ref={register({ setValueAs: numberOrNull })}
              placeholder="100..."
              min={0}
            />
            <Input
              type="number"
              label={t("products.stock.weight")}
              name="weight"
              ref={register({ setValueAs: numberOrNull })}
              placeholder="100..."
              min={0}
            />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-4 mb-large">
            <Input
              label={t("products.stock.mid_code")}
              name="mid_code"
              ref={register}
              placeholder="100..."
            />
            <Input
              label={t("products.stock.hs_code")}
              name="hs_code"
              ref={register}
              placeholder="100..."
            />
            <Controller
              control={control}
              name="origin_country"
              render={({ onChange, value }) => {
                return (
                  <Select
                    enableSearch
                    label={t("products.stock.origin_country")}
                    placeholder="Select a country"
                    options={countryOptions}
                    value={value}
                    onChange={onChange}
                  />
                )
              }}
            />
          </div>
        </div>
      </div>
    </BodyCard>
  )
}

export default StockAndInventory
