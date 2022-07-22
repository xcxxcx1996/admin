import React from "react"
import Button from "../../fundamentals/button"
import InputField from "../input"
import { trim } from "lodash"
import { useTranslation } from "react-i18next"

type SaveFilterItemProps = {
  saveFilter: () => void
  name: string
  setName: (name: string) => void
}

const SaveFilterItem: React.FC<SaveFilterItemProps> = ({
  saveFilter,
  setName,
  name,
}) => {
  const onSave = () => {
    const trimmedName = trim(name)
    if (trimmedName !== "") {
      saveFilter()
      setName("")
    }
  }
  const { t } = useTranslation()
  return (
    <div className="mt-2 flex w-full">
      <InputField
        className="pt-0 pb-1 max-w-[172px]"
        placeholder="Name your filter..."
        onChange={(e) => setName(e.target.value)}
        value={name}
      />
      <Button
        className="border ml-2 border-grey-20"
        variant="ghost"
        size="small"
        onClick={onSave}
      >
        {t("common.save")}
      </Button>
    </div>
  )
}

export default SaveFilterItem
