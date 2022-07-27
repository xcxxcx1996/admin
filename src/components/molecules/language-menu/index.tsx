import React, { useState } from "react"
import { useTranslation } from "react-i18next"

// import twLogo from "images/tw.png"
// import enLogo from "images/en.png"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import Button from "../../fundamentals/button"
import TranslationIcon from "../../fundamentals/icons/translation-icon"

const languages = {
  en: "English",
  zh: "中文",
}

const LanguageMenu = (props) => {
  const { t, i18n } = useTranslation()
  const [language, setLanguage] = useState("zh")

  function handleChange(language: string) {
    setLanguage(language)
    i18n.changeLanguage(language)
  }

  return (
    <div className="mr-large w-20 h-large">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <div className="cursor-pointer w-full h-full flex">
            <TranslationIcon size={24} />
            {languages[language]}
          </div>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content
          sideOffset={5}
          className="border bg-grey-0 border-grey-20 rounded-rounded shadow-dropdown p-xsmall min-w-[200px] z-30"
        >
          <DropdownMenu.Item className="mb-1 last:mb-0">
            <Button
              variant="ghost"
              size="small"
              className={"w-full justify-start"}
              onClick={() => handleChange("zh")}
            >
              中文
            </Button>
            <Button
              variant="ghost"
              size="small"
              className={"w-full justify-start"}
              onClick={() => handleChange("en")}
            >
              English
            </Button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  )
}

export default LanguageMenu
