import { useAdminCreateRegion, useAdminStore } from "medusa-react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Button from "../../../components/fundamentals/button"
import Input from "../../../components/molecules/input"
import Modal from "../../../components/molecules/modal"
import Select from "../../../components/molecules/select"
import CurrencyInput from "../../../components/organisms/currency-input"
import useNotification from "../../../hooks/use-notification"
import { countries as countryData } from "../../../utils/countries"
import { getErrorMessage } from "../../../utils/error-messages"
import { useTranslation } from "react-i18next"

const NewRegion = ({ onDone, onClick }) => {
  const [currencies, setCurrencies] = useState<string[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string | undefined>(
    undefined
  )
  const { t } = useTranslation()
  const [countries, setCountries] = useState([])
  const [paymentOptions, setPaymentOptions] = useState([])
  const [paymentProviders, setPaymentProviders] = useState([])
  const [fulfillmentOptions, setFulfillmentOptions] = useState([])
  const [fulfillmentProviders, setFulfillmentProviders] = useState([])

  const { store, isLoading: storeIsLoading } = useAdminStore()
  const createRegion = useAdminCreateRegion()
  const { register, setValue, handleSubmit } = useForm()
  const notification = useNotification()

  useEffect(() => {
    if (storeIsLoading || !store) {
      return
    }
    register({ name: "currency_code" })
    setCurrencies(store.currencies.map((currency) => currency.code))
    setPaymentOptions(
      store.payment_providers.map((c) => ({
        // Store Type is wrong, fix
        value: c.id,
        label: c.id,
      }))
    )
    setFulfillmentOptions(
      store.fulfillment_providers.map((c) => ({
        // Store Type is wrong, fix
        value: c.id,
        label: c.id,
      }))
    )
  }, [store, storeIsLoading])

  const handlePaymentChange = (values) => {
    setPaymentProviders(values)
    register({ name: "payment_providers" })
    setValue(
      "payment_providers",
      values.map((c) => c.value)
    )
  }

  const handleFulfillmentChange = (values) => {
    setFulfillmentProviders(values)
    register({ name: "fulfillment_providers" })
    setValue(
      "fulfillment_providers",
      values.map((c) => c.value)
    )
  }

  const handleChange = (values) => {
    setCountries(values)
    register({ name: "countries", required: true })
    setValue(
      "countries",
      values.map((c) => c.value)
    )
  }

  const onSave = (data) => {
    if (!data.countries?.length) {
      notification(
        t("common.status.success"),
        "Choose at least one country",
        "error"
      )
      return
    }

    createRegion.mutate(
      {
        ...data,
        currency_code: data.currency_code,
        tax_rate: data.tax_rate * 100,
      },
      {
        onSuccess: ({ region }) => {
          notification(
            t("common.status.success"),
            t("settings.region.create_success"),
            "success"
          )
          if (onDone) {
            onDone(region.id)
          }
          onClick()
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

  const countryOptions = countryData.map((c) => ({
    label: c.name,
    value: c.alpha2,
  }))

  const handleChangeCurrency = (currency: string) => {
    setValue("currency_code", currency)
    setSelectedCurrency(currency)
  }

  return (
    <Modal handleClose={onClick}>
      <form onSubmit={handleSubmit(onSave)}>
        <Modal.Body>
          <Modal.Header handleClose={onClick}>
            <div>
              <h1 className="inter-xlarge-semibold">
                {t("settings.region.add")}
              </h1>
            </div>
          </Modal.Header>
          <Modal.Content>
            <div>
              <p className="inter-base-semibold mb-base">General</p>
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-y-xsmall gap-x-base">
                <Input
                  name="name"
                  label={t("common.name")}
                  placeholder="Region name..."
                  ref={register({ required: true })}
                  className="mb-base min-w-[335px] w-full"
                />
                <CurrencyInput
                  currencyCodes={currencies}
                  currentCurrency={selectedCurrency}
                  onChange={handleChangeCurrency}
                  className="items-baseline"
                />
                <Input
                  className="mb-base min-w-[335px] w-full"
                  type="number"
                  placeholder="0.25"
                  step="0.01"
                  min={0}
                  max={1}
                  name="tax_rate"
                  label={t("settings.tax.rate")}
                  ref={register({ max: 1, min: 0 })}
                />
                <Input
                  placeholder="1000"
                  name="tax_code"
                  label={t("settings.tax.code")}
                  ref={register}
                  className="mb-base min-w-[335px] w-full"
                />
                <Select
                  isMultiSelect
                  enableSearch
                  label={t("settings.region.country")}
                  hasSelectAll
                  options={countryOptions}
                  value={countries}
                  onChange={handleChange}
                  className="mb-base min-w-[335px] w-full"
                />
              </div>
            </div>
            <div className="mt-xlarge mb-small">
              <p className="inter-base-semibold mb-base">
                {t("settings.region.provider")}
              </p>
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-base">
                {!!paymentOptions.length && (
                  <Select
                    isMultiSelect
                    onChange={handlePaymentChange}
                    options={paymentOptions}
                    value={paymentProviders}
                    label={t("settings.region.payment")}
                    enableSearch
                  />
                )}
                {!!fulfillmentOptions.length && (
                  <Select
                    onChange={handleFulfillmentChange}
                    options={fulfillmentOptions}
                    value={fulfillmentProviders}
                    label={t("settings.region.fulfillment")}
                    enableSearch
                    isMultiSelect
                  />
                )}
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex items-center justify-end w-full gap-x-xsmall">
              <Button
                type="button"
                onClick={onClick}
                variant="secondary"
                size="small"
                className="w-eventButton justify-center"
              >
                {t("common.cancel_change")}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="small"
                className="w-eventButton justify-center"
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

export default NewRegion
