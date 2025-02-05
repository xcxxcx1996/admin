import { useAdminCreateGiftCard, useAdminRegions } from "medusa-react"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Button from "../../components/fundamentals/button"
import InputField from "../../components/molecules/input"
import Modal from "../../components/molecules/modal"
import Select from "../../components/molecules/select"
import Textarea from "../../components/molecules/textarea"
import CurrencyInput from "../../components/organisms/currency-input"
import useNotification from "../../hooks/use-notification"
import { getErrorMessage } from "../../utils/error-messages"
import { focusByName } from "../../utils/focus-by-name"
import { validateEmail } from "../../utils/validate-email"
import { useTranslation } from "react-i18next"

type CustomGiftcardProps = {
  onDismiss: () => void
}

const CustomGiftcard: React.FC<CustomGiftcardProps> = ({ onDismiss }) => {
  const { isLoading, regions } = useAdminRegions()
  const [selectedRegion, setSelectedRegion] = useState<any>(null)
  const [giftCardAmount, setGiftCardAmount] = useState(0)

  const { register, handleSubmit } = useForm()

  const notification = useNotification()
  const { t } = useTranslation()
  const createGiftCard = useAdminCreateGiftCard()

  useEffect(() => {
    if (!isLoading) {
      setSelectedRegion({
        value: regions[0],
        label: regions[0].name,
      })
    }
  }, [isLoading])

  const onSubmit = (data) => {
    if (!giftCardAmount) {
      notification(t("common.status.error"), "Please enter an amount", "error")
      focusByName("amount")
      return
    }

    if (!validateEmail(data.metadata.email)) {
      notification(t("common.status.error"), "Invalid email address", "error")
      focusByName("metadata.email")
      return
    }

    const update = {
      region_id: selectedRegion.value.id,
      value: Math.round(
        giftCardAmount / (1 + selectedRegion.value.tax_rate / 100)
      ),
      ...data,
    }

    createGiftCard.mutate(update, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          "Created Custom Gift Card",
          "success"
        )
        onDismiss()
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
        onDismiss()
      },
    })
  }

  return (
    <Modal handleClose={onDismiss}>
      <Modal.Body>
        <Modal.Header handleClose={onDismiss}>
          <h2 className="inter-xlarge-semibold">Custom Gift Card</h2>
        </Modal.Header>
        <Modal.Content>
          <div className="flex flex-col">
            <span className="inter-base-semibold">Value</span>
            <div className="flex gap-x-2xsmall mt-4">
              <div className="w-[267px]">
                <Select
                  label={"Region"}
                  value={selectedRegion}
                  onChange={(value) => setSelectedRegion(value)}
                  options={
                    regions?.map((r) => ({
                      value: r,
                      label: r.name,
                    })) || []
                  }
                />
              </div>
              <div className="w-[415px]">
                <CurrencyInput
                  size="medium"
                  currencyCodes={
                    isLoading ? undefined : regions?.map((r) => r.currency_code)
                  }
                  readOnly
                  currentCurrency={selectedRegion?.value?.currency_code}
                >
                  <CurrencyInput.AmountInput
                    label={"Amount"}
                    amount={giftCardAmount}
                    onChange={(value) => {
                      setGiftCardAmount(value || 0)
                    }}
                    name="amount"
                    required={true}
                  />
                </CurrencyInput>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <span className="inter-base-semibold">Receiver</span>
            <div className="grid grid-cols-1 gap-y-xsmall mt-4">
              <InputField
                label={t("customers.email")}
                required
                name="metadata.email"
                placeholder="lebron@james.com"
                type="email"
                ref={register({ required: true })}
              />
              <Textarea
                label={"Personal Message"}
                rows={7}
                placeholder="Something nice to someone special"
                name="metadata.personal_message"
                ref={register()}
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full justify-end gap-x-xsmall">
            <Button
              variant="ghost"
              onClick={onDismiss}
              size="small"
              className="w-[112px]"
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={handleSubmit(onSubmit)}
              size="small"
              className="w-[112px]"
            >
              Create & Send
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default CustomGiftcard
