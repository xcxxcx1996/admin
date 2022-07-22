import { Discount } from "@medusajs/medusa"
import React, { useState } from "react"
import PlusIcon from "../../../../components/fundamentals/icons/plus-icon"
import NumberedItem from "../../../../components/molecules/numbered-item"
import BodyCard from "../../../../components/organisms/body-card"
import AddCondition from "./add-condition"
import { ConditionsProvider } from "./add-condition/conditions-provider"
import { useDiscountConditions } from "./use-discount-conditions"
import { useTranslation } from "react-i18next"

type ConditionsProps = {
  discount: Discount
}

const Conditions: React.FC<ConditionsProps> = ({ discount }) => {
  const [show, setShow] = useState(false)
  const conditions = useDiscountConditions(discount)
  const { t } = useTranslation()
  return (
    <ConditionsProvider discount={discount}>
      <BodyCard
        title={t("discounts.conditions.title")}
        className="min-h-[200px]"
        forceDropdown
        actionables={[
          {
            label: t("discounts.conditions.add"),
            icon: <PlusIcon size={16} />,
            onClick: () => setShow(true),
          },
        ]}
      >
        {conditions.length ? (
          <div
            style={{
              gridTemplateRows: `repeat(${Math.ceil(
                conditions?.length / 2
              )}, minmax(0, 1fr))`,
            }}
            className="grid grid-cols-2 grid-flow-col gap-y-base gap-x-xlarge"
          >
            {conditions.map((condition, i) => (
              <NumberedItem
                key={i}
                title={condition.title}
                index={i + 1}
                description={condition.description}
                actions={condition.actions}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center flex-1 gap-y-small">
            <span className="inter-base-regular text-grey-50">
              {t("discounts.conditions.no_conditions")}
            </span>
          </div>
        )}
      </BodyCard>
      <AddCondition show={show} onClose={() => setShow(false)} />
    </ConditionsProvider>
  )
}

export default Conditions
