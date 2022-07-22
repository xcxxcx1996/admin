import { useAdminResendNotification } from "medusa-react"
import React from "react"
import { useForm } from "react-hook-form"
import Button from "../../../../components/fundamentals/button"
import Input from "../../../../components/molecules/input"
import Modal from "../../../../components/molecules/modal"
import useNotification from "../../../../hooks/use-notification"
import { getErrorMessage } from "../../../../utils/error-messages"
import { useTranslation } from "react-i18next"

type ResendModalProps = {
  notificationId: string
  email: string
  handleCancel: () => void
}

const ResendModal: React.FC<ResendModalProps> = ({
  notificationId,
  email,
  handleCancel,
}) => {
  const resendNotification = useAdminResendNotification(notificationId)
  const { t } = useTranslation()
  const { register, handleSubmit } = useForm({
    defaultValues: { to: email },
  })

  const notification = useNotification()

  const handleResend = (data) => {
    resendNotification.mutate(
      {
        to: data.to.trim(),
      },
      {
        onSuccess: () => {
          notification(
            t("common.status.success"),
            `Notification re-send to ${data.to}`,
            "success"
          )
          handleCancel()
        },
        onError: (err) =>
          notification(t("common.status.error"), getErrorMessage(err), "error"),
      }
    )
  }

  return (
    <Modal handleClose={handleCancel}>
      <form onSubmit={handleSubmit(handleResend)}>
        <Modal.Body>
          <Modal.Header handleClose={handleCancel}>
            <span className="inter-xlarge-semibold">Resend notification</span>
          </Modal.Header>
          <Modal.Content>
            <div className="flex flex-col">
              <div className="flex flex-col space-y-2">
                <Input
                  label={t("customers.email")}
                  type="text"
                  placeholder={t("customers.email")}
                  name={`to`}
                  ref={register({
                    required: "Must be filled",
                  })}
                />
              </div>
            </div>
          </Modal.Content>
          <Modal.Footer>
            <div className="flex w-full h-8 justify-end">
              <div className="flex">
                <Button
                  variant="ghost"
                  className="mr-2 w-32 text-small justify-center"
                  size="large"
                  onClick={handleCancel}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="large"
                  className="w-32 text-small justify-center"
                  variant="primary"
                  type="submit"
                >
                  Send
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Body>
      </form>
    </Modal>
  )
}

export default ResendModal
