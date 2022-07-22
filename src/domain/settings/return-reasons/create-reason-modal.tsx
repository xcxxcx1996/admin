import { useAdminCreateReturnReason } from "medusa-react"
import React from "react"
import { useForm } from "react-hook-form"
import Button from "../../../components/fundamentals/button"
import Input from "../../../components/molecules/input"
import Modal from "../../../components/molecules/modal"
import useNotification from "../../../hooks/use-notification"
import { useTranslation } from "react-i18next"

type CreateReturnReasonModalProps = {
  handleClose: () => void
  initialReason?: any
}

// the reason props is used for prefilling the form when duplicating
const CreateReturnReasonModal = ({
  handleClose,
  initialReason,
}: CreateReturnReasonModalProps) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      value: initialReason?.value,
      label: initialReason?.label,
      description: initialReason?.description,
    },
  })
  const notification = useNotification()
  const createRR = useAdminCreateReturnReason()
  const { t } = useTranslation()
  const onCreate = async (data) => {
    await createRR.mutateAsync(data, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          t("settings.return_reason.create_success"),
          "success"
        )
      },
      onError: () => {
        notification(
          t("common.status.error"),
          t("settings.return_reason.create_error"),
          "error"
        )
      },
    })
    handleClose()
  }

  return (
    <Modal handleClose={handleClose}>
      <Modal.Body>
        <Modal.Header handleClose={handleClose}>
          <span className="inter-xlarge-semibold">
            {t("settings.return_reason.add")}
          </span>
        </Modal.Header>
        <Modal.Content>
          <div className="flex">
            <Input
              ref={register({ required: true })}
              name="value"
              label={t("common.value")}
              placeholder="wrong_size"
            />
            <Input
              className="ml-base"
              ref={register({ required: true })}
              name="label"
              label={t("common.label")}
              placeholder="Wrong size"
            />
          </div>
          <Input
            className="mt-large"
            ref={register}
            name="description"
            label={t("common.description")}
            placeholder="Customer received a wrong size"
          />
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
              loading={createRR.isLoading}
              size="large"
              className="w-32 text-small justify-center"
              variant="primary"
              onClick={handleSubmit(onCreate)}
            >
              {t("common.create")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  )
}

export default CreateReturnReasonModal
