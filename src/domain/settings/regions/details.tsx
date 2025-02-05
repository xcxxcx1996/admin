import {
  useAdminCreateRegion,
  useAdminDeleteRegion,
  useAdminRegion,
  useAdminStore,
  useAdminUpdateRegion,
} from "medusa-react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Spinner from "../../../components/atoms/spinner"
import DuplicateIcon from "../../../components/fundamentals/icons/duplicate-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import Input from "../../../components/molecules/input"
import Select from "../../../components/molecules/select"
import BodyCard from "../../../components/organisms/body-card"
import CurrencyInput from "../../../components/organisms/currency-input"
import DeletePrompt from "../../../components/organisms/delete-prompt"
import useNotification from "../../../hooks/use-notification"
import { Option } from "../../../types/shared"
import { countries as countryData } from "../../../utils/countries"
import { getErrorMessage } from "../../../utils/error-messages"
import fulfillmentProvidersMapper from "../../../utils/fulfillment-providers.mapper"
import paymentProvidersMapper from "../../../utils/payment-providers-mapper"
import Shipping from "./shipping"
import { useTranslation } from "react-i18next"

const RegionDetails = ({ id, onDelete, handleSelect }) => {
  const [currencies, setCurrencies] = useState([])
  const [countries, setCountries] = useState<Option[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string>()
  const [paymentOptions, setPaymentOptions] = useState<Option[]>([])
  const [paymentProviders, setPaymentProviders] = useState<Option[]>([])
  const [fulfillmentOptions, setFulfillmentOptions] = useState<Option[]>([])
  const [fulfillmentProviders, setFulfillmentProviders] = useState<Option[]>([])

  const { register, reset, setValue, handleSubmit } = useForm()
  const notification = useNotification()
  const { t } = useTranslation()
  const { store, isLoading: storeIsLoading } = useAdminStore()
  const { fulfillment_providers, payment_providers } = store
  const createRegion = useAdminCreateRegion()
  const deleteRegion = useAdminDeleteRegion(id)
  const { region, isLoading: regionIsLoading } = useAdminRegion(id)
  const updateRegion = useAdminUpdateRegion(id)

  const [showDanger, setShowDanger] = useState(false)

  useEffect(() => {
    if (!store || !region) {
      return
    }
    register({ name: "currency_code" })
    setValue("currency_code", region.currency_code)
    setSelectedCurrency(region.currency_code)
    setCurrencies(getCurrencies(store.currencies))
  }, [store, region])

  useEffect(() => {
    if (!payment_providers) {
      return
    }
    setPaymentOptions(
      payment_providers.map((c) => paymentProvidersMapper(c.id))
    )
  }, [payment_providers])

  useEffect(() => {
    if (!fulfillment_providers) {
      return
    }

    setFulfillmentOptions(
      fulfillment_providers.map((c) => fulfillmentProvidersMapper(c.id))
    )
  }, [fulfillment_providers])

  useEffect(() => {
    if (!region) {
      return
    }
    reset({ ...region })
    register({ name: "countries" })
    register({ name: "payment_providers" })
    register({ name: "fulfillment_providers" })

    setValue(
      "countries",
      region.countries.map((c) => c.iso_2)
    )
    setCountries(
      region.countries.map((c) => ({ value: c.iso_2, label: c.display_name }))
    )

    setValue(
      "payment_providers",
      region.payment_providers.map((v) => v.id)
    )
    setPaymentProviders(
      region.payment_providers.map((v) => paymentProvidersMapper(v.id))
    )

    setValue(
      "fulfillment_providers",
      region?.fulfillment_providers.map((v) => v.id)
    )
    setFulfillmentProviders(
      region.fulfillment_providers.map((v) => fulfillmentProvidersMapper(v.id))
    )
  }, [region])

  const getCurrencies = (storeCurrencies) => {
    const currs = storeCurrencies
      .filter((item) => item.code !== region?.currency_code)
      .map((el) => el.code)
    currs.unshift(region?.currency_code)

    return currs ?? []
  }

  const handlePaymentChange = (values) => {
    setPaymentProviders(values)
    setValue(
      "payment_providers",
      values.map((v) => v.value)
    )
  }

  const handleFulfillmentChange = (values) => {
    const providers = values.map((v) => ({ value: v.value }))
    setFulfillmentProviders(providers)
    setValue(
      "fulfillment_providers",
      values.map((v) => v.value)
    )
  }

  const handleChange = (values) => {
    setCountries(values)
    setValue(
      "countries",
      values.map((c) => c.value)
    )
  }

  const handleChangeCurrency = (value) => {
    setValue("currency_code", value)
    setSelectedCurrency(value)
  }

  const onSave = async (data) => {
    if (!data.countries || data.countries.length === 0) {
      return
    }

    updateRegion.mutate(
      {
        ...data,
        currency_code: selectedCurrency,
      },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            t("settings.region.update_success"),
            "success"
          )
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
    value: c.alpha2.toLowerCase(),
  }))

  const handleDuplicate = () => {
    if (!region) {
      notification(
        t("common.status.error"),
        t("settings.region.not_found"),
        "error"
      )
      return
    }

    const payload = {
      currency_code: region.currency_code,
      payment_providers: region.payment_providers.map((p) => p.id),
      fulfillment_providers: region.fulfillment_providers.map((f) => f.id),
      countries: [], // As countries can't belong to more than one region at the same time we can just pass an empty array
      name: `${region.name} Copy`,
      tax_rate: region.tax_rate,
    }

    createRegion.mutate(payload, {
      onSuccess: ({ region }) => {
        notification(
          t("common.status.success"),
          t("settings.region.duplicate_success"),
          "success"
        )
        handleSelect(region.id)
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  const handleDelete = async () => {
    deleteRegion.mutate(undefined, {
      onSuccess: () => {
        if (onDelete) {
          onDelete(null)
        }
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  if (storeIsLoading || !currencies.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen mt-auto">
        <div className="h-[75px] w-[75px] mt-[50%]">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <>
      <BodyCard
        title={t("orders.field.detail")}
        events={[{ label: t("common.save"), onClick: handleSubmit(onSave) }]}
        actionables={[
          {
            label: t("settings.region.duplicate"),
            onClick: handleDuplicate,
            icon: <DuplicateIcon />,
          },
          {
            label: t("settings.region.delete"),
            onClick: () => setShowDanger(true),
            icon: <TrashIcon />,
            variant: "danger",
          },
        ]}
      >
        <form onSubmit={handleSubmit(onSave)}>
          <div className="flex flex-col w-full">
            {regionIsLoading || storeIsLoading ? (
              <div className="flex flex-col items-center justify-center h-screen mt-auto">
                <div className="h-[75px] w-[75px] mt-[50%]">
                  <Spinner />
                </div>
              </div>
            ) : (
              <div className="w-full">
                <Input
                  name="name"
                  label={t("common.name")}
                  placeholder="Region name..."
                  ref={register({ required: true })}
                  className="mb-base"
                />
                <CurrencyInput
                  currentCurrency={selectedCurrency}
                  currencyCodes={currencies}
                  onChange={handleChangeCurrency}
                  className="mb-base"
                />
                <Select
                  isMultiSelect
                  enableSearch
                  label={t("settings.region.country")}
                  hasSelectAll
                  options={countryOptions}
                  value={countries}
                  onChange={handleChange}
                  className="mb-base"
                />
                {!!paymentOptions.length && (
                  <Select
                    isMultiSelect
                    onChange={handlePaymentChange}
                    options={paymentOptions}
                    value={paymentProviders}
                    label={t("settings.region.payment")}
                    enableSearch
                    className="mb-base"
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
            )}
          </div>
        </form>
        {region && fulfillmentOptions && (
          <div className="mt-2xlarge">
            <Shipping region={region} />
          </div>
        )}
      </BodyCard>
      {showDanger && (
        <DeletePrompt
          handleClose={() => setShowDanger(!showDanger)}
          text={t("settings.region.delete_text")}
          heading={t("settings.region.delete")}
          onDelete={handleDelete}
          successText={t("settings.region.delete_success")}
          confirmText={t("settings.region.delete_confirm")}
        />
      )}
    </>
  )
}

export default RegionDetails
