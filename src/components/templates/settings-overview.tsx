import React from "react"
import PageDescription from "../atoms/page-description"
import { useTranslation } from "react-i18next"

const SettingsOverview: React.FC = ({ children }) => {
  const { t } = useTranslation()
  return (
    <div>
      <PageDescription
        title={t("settings.title")}
        subtitle={"Manage the settings for your Medusa store"}
      />
      <div className="grid medium:grid-cols-2 auto-cols-fr grid-cols-1 gap-x-base gap-y-xsmall">
        {children}
      </div>
    </div>
  )
}

export default SettingsOverview
