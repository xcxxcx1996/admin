import { Router } from "@reach/router"
import React from "react"
import { useTranslation } from "react-i18next"
import SettingsCard from "../../components/atoms/settings-card"
import CoinsIcon from "../../components/fundamentals/icons/coins-icon"
import CrosshairIcon from "../../components/fundamentals/icons/crosshair-icon"
import DollarSignIcon from "../../components/fundamentals/icons/dollar-sign-icon"
import HappyIcon from "../../components/fundamentals/icons/happy-icon"
import MapPinIcon from "../../components/fundamentals/icons/map-pin-icon"
import TaxesIcon from "../../components/fundamentals/icons/taxes-icon"
import TruckIcon from "../../components/fundamentals/icons/truck-icon"
import UsersIcon from "../../components/fundamentals/icons/users-icon"
import SettingsOverview from "../../components/templates/settings-overview"
import Currencies from "./currencies"
import Details from "./details"
import PersonalInformation from "./personal-information"
import Regions from "./regions"
import RegionDetails from "./regions/details"
import NewRegion from "./regions/new"
import ReturnReasons from "./return-reasons"
import Taxes from "./taxes"
import Users from "./users"

const SettingsIndex = () => {
  const { t } = useTranslation()
  return (
    <SettingsOverview>
      <SettingsCard
        heading={t("settings.region.title")}
        description={t("settings.regions.description")}
        icon={<MapPinIcon />}
        to={`/a/settings/regions`}
      />
      <SettingsCard
        heading={t("settings.currencies.title")}
        description={t("settings.currencies.description")}
        icon={<CoinsIcon />}
        to={`/a/settings/currencies`}
      />
      <SettingsCard
        heading={t("settings.store.title")}
        description={t("settings.store.description")}
        icon={<CrosshairIcon />}
        to={`/a/settings/details`}
      />
      {/* <SettingsCard
        heading={t("orders.field.shipping")}
        description={t("settings.currencies.description")}
        icon={<TruckIcon />}
        to={`/a/settings/shipping-profiles`}
        disabled={true}
      /> */}
      <SettingsCard
        heading={t("settings.return_reason.title")}
        description={t("settings.return_reason.description")}
        icon={<DollarSignIcon />}
        to={`/a/settings/return-reasons`}
      />
      <SettingsCard
        heading={t("settings.tax.title")}
        description={t("settings.tax.description")}
        icon={<TaxesIcon />}
        to={`/a/settings/taxes`}
      />
      <SettingsCard
        heading={"The Team"}
        description={t("settings.user.description")}
        icon={<UsersIcon />}
        to={`/a/settings/team`}
      />
      <SettingsCard
        heading={"Personal Information"}
        description={t("settings.currencies.description")}
        icon={<HappyIcon />}
        to={`/a/settings/personal-information`}
      />
      {/* <SettingsCard
        heading={"hello@medusajs.com"}
        description={"Can’t find the answers you’re looking for?"}
        icon={<MailIcon />}
        externalLink={"mailto: hello@medusajs.com"}
      /> */}
    </SettingsOverview>
  )
}

const Settings = () => (
  <Router className="h-full">
    <SettingsIndex path="/" />

    <Details path="details" />

    <Currencies path="currencies" />

    <ReturnReasons path="return-reasons" />

    <Regions path="regions" />
    <RegionDetails path="regions/:id" />
    <NewRegion path="regions/new" />

    <Taxes path="taxes" />

    <Users path="team" />

    <PersonalInformation path="personal-information" />
  </Router>
)

export default Settings
