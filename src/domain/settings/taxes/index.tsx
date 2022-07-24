import { useAdminRegions } from "medusa-react"
import { navigate } from "gatsby"
import React, { useEffect, useState } from "react"
import Spinner from "../../../components/atoms/spinner"
import GearIcon from "../../../components/fundamentals/icons/gear-icon"
import BreadCrumb from "../../../components/molecules/breadcrumb"
import BodyCard from "../../../components/organisms/body-card"
import RadioGroup from "../../../components/organisms/radio-group"
import TwoSplitPane from "../../../components/templates/two-split-pane"
import TaxDetails from "./details"
import { useTranslation } from "react-i18next"

const Taxes = () => {
  const { regions, isLoading, refetch } = useAdminRegions()
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(
    undefined
  )
  const { t } = useTranslation()
  useEffect(() => {
    if (!isLoading && regions && selectedRegion === null) {
      setSelectedRegion(regions[0].id)
    }
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
          currentPage={t("settings.tax.title")}
        />
        <TwoSplitPane threeCols>
          <BodyCard
            forceDropdown
            title={t("settings.region.title")}
            subtitle={t("settings.region.title")}
            actionables={[
              {
                icon: <GearIcon />,
                label: t("settings.tax.to_region"),
                onClick: () => navigate("/a/settings/regions"),
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
                  return (
                    <RadioGroup.Item
                      label={r.name}
                      description={
                        r.countries.length
                          ? `${r.countries
                              .map((c) => c.display_name)
                              .join(", ")}`
                          : undefined
                      }
                      value={r.id}
                      key={r.id}
                      id={r.id}
                    />
                  )
                })}
              </RadioGroup.Root>
            )}
          </BodyCard>
          <TaxDetails
            id={selectedRegion}
            // onDelete={handleDelete}
            // handleSelect={handleSelect}
          />
        </TwoSplitPane>
      </div>
    </>
  )
}

export default Taxes
