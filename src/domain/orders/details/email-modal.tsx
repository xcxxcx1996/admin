import React from "react"
import { useForm } from "react-hook-form"

import Button from "../../../components/fundamentals/button"
import Input from "../../../components/molecules/input"
import Modal from "../../../components/molecules/modal"
import { useTranslation } from "react-i18next"

type EmailModalProps = {
  handleClose: () => void
  handleSave: ({ email: string }) => Promise<void>
  email?: string
}

const EmailModal: React.FC<EmailModalProps> = ({
  email,
  handleClose,
  handleSave,
}) => {
  const { t } = useTranslation()
  const { register, handleSubmit } = useForm({
    defaultValues: { email },
  })

  const submit = (data) => {
    return handleSave(data)
  }

  return (
    <Modal handleClose={handleClose}>
      <Modal.Body>
        <Modal.Header handleClose={handleClose}>
          <span className="inter-xlarge-semibold">Email Address</span>
        </Modal.Header>
        <Modal.Content>
          <div className="space-y-4">
            <div className="flex mt-4 space-x-4">
              <Input
                label={t("customers.email")}
                name="email"
                ref={register}
                placeholder={t("customers.email")}
              />
            </div>
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full h-8 justify-end">
            <Button
              variant="ghost"
              className="mr-2 w-32 text-small justify-center"
              size="large"
              onClick={handleClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="large"
              className="w-32 text-small justify-center"
              variant="primary"
              onClick={handleSubmit(submit)}
            >
              {t("common.save")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default EmailModal
