import React from "react"
import InputField from "../../../../components/molecules/input"
import Accordion from "../../../../components/organisms/accordion"
import { usePriceListForm } from "../form/pricing-form-context"
import { useTranslation } from "react-i18next"

const General = () => {
  const { register } = usePriceListForm()
  const { t } = useTranslation()
  return (
    <Accordion.Item
      forceMountContent
      required
      title={t("common.general")}
      tooltip="General information for the price list."
      value="general"
    >
      <div className="flex flex-col gap-y-small group-radix-state-open:mt-5 accordion-margin-transition">
        <InputField
          label={t("common.name")}
          name="name"
          required
          placeholder="B2B, Black Friday..."
          ref={register({ required: "Name is required" })}
        />
        <InputField
          label={t("common.description")}
          name="description"
          required
          placeholder="For our business partners..."
          ref={register({ required: "Description is required" })}
        />
      </div>
    </Accordion.Item>
  )
}

export default General
