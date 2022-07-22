import { Discount } from "@medusajs/medusa"
import { useAdminRegions, useAdminUpdateDiscount } from "medusa-react"
import React, { useEffect, useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import Button from "../../../../components/fundamentals/button"
import InputField from "../../../../components/molecules/input"
import Modal from "../../../../components/molecules/modal"
import Select from "../../../../components/molecules/select"
import Textarea from "../../../../components/molecules/textarea"
import CurrencyInput from "../../../../components/organisms/currency-input"
import useNotification from "../../../../hooks/use-notification"
import { Option } from "../../../../types/shared"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"

type EditGeneralProps = {
  discount: Discount
  onClose: () => void
}

type GeneralForm = {
  regions: Option[]
  code: string
  description: string
  value: number
}

const EditGeneral: React.FC<EditGeneralProps> = ({ discount, onClose }) => {
  const { mutate, isLoading } = useAdminUpdateDiscount(discount.id)
  const notification = useNotification()
  const { t } = useTranslation()
  const { control, handleSubmit, reset, register } = useForm<GeneralForm>({
    defaultValues: mapGeneral(discount),
  })

  const onSubmit = (data: GeneralForm) => {
    mutate(
      {
        regions: data.regions.map((r) => r.value),
        code: data.code,
        rule: {
          id: discount.rule.id,
          description: data.description,
          value: data.value,
          allocation: discount.rule.allocation,
        },
      },
      {
        onSuccess: ({ discount }) => {
          notification(
            t("common.status.success"),
            t("discounts.update_success"),
            "success"
          )
          reset(mapGeneral(discount))
          onClose()
        },
        onError: (error) => {
          notification(
            t("common.status.error"),
            getErrorMessage(error),
            "error"
          )
        },
      }
    )
  }

  useEffect(() => {
    reset(mapGeneral(discount))
  }, [discount])

  const type = discount.rule.type

  const { regions } = useAdminRegions()

  const regionOptions = useMemo(() => {
    return regions
      ? regions.map((r) => ({
          label: r.name,
          value: r.id,
        }))
      : []
  }, [regions])

  const selectedRegions = useWatch<Option[]>({
    control,
    name: "regions",
  })

  const fixedCurrency = useMemo(() => {
    if (type === "fixed" && selectedRegions?.length) {
      return regions?.find((r) => r.id === selectedRegions[0].value)
        ?.currency_code
    }
  }, [selectedRegions, type, regions])

  return (
    <Modal handleClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Modal.Header handleClose={onClose}>
            <h1 className="inter-xlarge-semibold">Edit general information</h1>
          </Modal.Header>
          <Modal.Content isLargeModal>
            <Controller
              name="regions"
              control={control}
              rules={{
                required: t("discounts.region_require"),
                validate: (value) =>
                  Array.isArray(value) ? value.length > 0 : !!value,
              }}
              render={({ value, onChange }) => {
                return (
                  <Select
                    value={value}
                    onChange={(value) => {
                      onChange(type === "fixed" ? [value] : value)
                    }}
                    label={t("discounts.region_label")}
                    isMultiSelect={type !== "fixed"}
                    hasSelectAll={type !== "fixed"}
                    enableSearch
                    required
                    options={regionOptions}
                  />
                )
              }}
            />
            <div className="flex gap-x-base gap-y-base my-base">
              <InputField
                label={t("discounts.code_label")}
                className="flex-1"
                placeholder="SUMMERSALE10"
                required
                name="code"
                ref={register({ required: t("discounts.code_require") })}
              />

              {type !== "free_shipping" && (
                <>
                  {type === "fixed" ? (
                    <div className="flex-1">
                      <CurrencyInput
                        size="small"
                        currentCurrency={fixedCurrency ?? "USD"}
                        readOnly
                        hideCurrency
                      >
                        <Controller
                          name="value"
                          control={control}
                          rules={{
                            required: t("discounts.amount_require"),
                            min: 1,
                          }}
                          render={({ value, onChange }) => {
                            return (
                              <CurrencyInput.AmountInput
                                label={t("discounts.amount_label")}
                                required
                                amount={value}
                                onChange={onChange}
                              />
                            )
                          }}
                        />
                      </CurrencyInput>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <InputField
                        label={t("discounts.percentage_label")}
                        min={0}
                        required
                        type="number"
                        placeholder="10"
                        prefix={"%"}
                        name="value"
                        ref={register({
                          required: t("discounts.percentage_require"),
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="text-grey-50 inter-small-regular flex flex-col mb-6">
              <span>{t("discounts.code_description")}</span>
              <span>{t("discounts.code_description2")}</span>
            </div>
            <Textarea
              label={t("commons.description")}
              required
              placeholder="Summer Sale 2022"
              rows={1}
              name="description"
              ref={register({
                required: t("discounts.description_require"),
              })}
            />
          </Modal.Content>
          <Modal.Footer>
            <div className="gap-x-xsmall flex items-center justify-end w-full">
              <Button
                variant="ghost"
                size="small"
                className="min-w-[128px]"
                type="button"
                onClick={onClose}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="primary"
                size="small"
                className="min-w-[128px]"
                type="submit"
                loading={isLoading}
              >
                {t("common.save")}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  )
}

const mapGeneral = (discount: Discount): GeneralForm => {
  return {
    regions: discount.regions.map((r) => ({ label: r.name, value: r.id })),
    code: discount.code,
    description: discount.rule.description,
    value: discount.rule.value,
  }
}

export default EditGeneral
