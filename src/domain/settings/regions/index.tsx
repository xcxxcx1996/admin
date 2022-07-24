import { useAdminRegions } from "medusa-react"
import React, { useEffect, useState } from "react"
import Spinner from "../../../components/atoms/spinner"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import BreadCrumb from "../../../components/molecules/breadcrumb"
import BodyCard from "../../../components/organisms/body-card"
import RadioGroup from "../../../components/organisms/radio-group"
import TwoSplitPane from "../../../components/templates/two-split-pane"
import fulfillmentProvidersMapper from "../../../utils/fulfillment-providers.mapper"
import paymentProvidersMapper from "../../../utils/payment-providers-mapper"
import RegionDetails from "./details"
import NewRegion from "./new"
import { useTranslation } from "react-i18next"

const Regions = () => {
  const { regions, isLoading, refetch } = useAdminRegions()
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    undefined
  )
  const { t } = useTranslation()
  const [addRegion, setAddRegion] = useState(false)

  useEffect(() => {
    const setRegion = () => {
      if (!isLoading && selectedRegion === null) {
        setSelectedRegion(regions?.[0]?.id)
      }
    }

    setRegion()
  }, [regions, isLoading, selectedRegion])

  const handleDelete = () => {
    refetch().then(({ data }) => {
      const id = data?.regions?.[0]?.id

      if (!id) {
        return
      }

      setSelectedRegion(id)
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      })
    })
  }

  const handleSelect = (id: string) => {
    refetch().then(() => {
      setSelectedRegion(id)
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
      })
    })
  }

  return (
    <>
      <div>
        <BreadCrumb
          previousRoute="/a/settings"
          previousBreadcrumb={t("settings.title")}
          currentPage={t("settings.region.title")}
        />
        <TwoSplitPane>
          <BodyCard
            title={t("settings.region.title")}
            subtitle="Manage the markets that you will operate within"
            actionables={[
              {
                icon: <PlusIcon />,
                label: t("settings.region.add"),
                onClick: () => setAddRegion(!addRegion),
              },
            ]}
          >
            {isLoading || !regions ? (
              <div className="flex-grow h-full flex items-center justify-center">
                <Spinner size="large" variant="secondary" />
              </div>
            ) : (
              <RadioGroup.Root
                value={selectedRegion}
                onValueChange={setSelectedRegion}
              >
                {regions.map((r) => {
                  const providers = `${t("settings.region.payment")} ${
                    r.payment_providers
                      .map((pp) => paymentProvidersMapper(pp.id).label)
                      .join(", ") || t("settings.region.not_configured")
                  } - ${t("settings.region.fulfillment")} ${
                    r.fulfillment_providers
                      .map((fp) => fulfillmentProvidersMapper(fp.id).label)
                      .join(", ") || t("settings.region.not_configured")
                  }`
                  return (
                    <RadioGroup.Item
                      label={r.name}
                      sublabel={
                        r.countries.length
                          ? `(${r.countries
                              .map((c) => c.display_name)
                              .join(", ")})`
                          : undefined
                      }
                      description={providers}
                      value={r.id}
                      key={r.id}
                      id={r.id}
                    ></RadioGroup.Item>
                  )
                })}
              </RadioGroup.Root>
            )}
          </BodyCard>
          {selectedRegion && (
            <RegionDetails
              id={selectedRegion}
              onDelete={handleDelete}
              handleSelect={handleSelect}
            />
          )}
        </TwoSplitPane>
      </div>
      {addRegion && (
        <NewRegion
          onClick={() => setAddRegion(!addRegion)}
          onDone={handleSelect}
        />
      )}
    </>
  )
}

export default Regions
