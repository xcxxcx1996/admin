import {
  useAdminDeleteReturnReason,
  useAdminUpdateReturnReason,
} from "medusa-react"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import DuplicateIcon from "../../../components/fundamentals/icons/duplicate-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import Input from "../../../components/molecules/input"
import BodyCard from "../../../components/organisms/body-card"
import DeletePrompt from "../../../components/organisms/delete-prompt"
import useToggleState from "../../../hooks/use-toggle-state"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"
import CreateReturnReasonModal from "./create-reason-modal"
import { useTranslation } from "react-i18next"

const ReturnReasonDetail = ({ reason }) => {
  const {
    state: showDuplicateModal,
    open: handleOpenDuplicateModal,
    close: handleCloseDuplicateModal,
  } = useToggleState()
  const {
    state: showDanger,
    open: handleClosePrompt,
    close: handleOpenPrompt,
  } = useToggleState()
  const { register, reset, handleSubmit } = useForm()
  const notification = useNotification()
  const deleteRR = useAdminDeleteReturnReason(reason?.id)
  const updateRR = useAdminUpdateReturnReason(reason?.id)

  const handleDeletion = async () => {
    deleteRR.mutate(undefined)
  }
  const { t } = useTranslation()
  const onSave = (data) => {
    if (data.label === "") {
      return
    }
    updateRR.mutate(data, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          t("settings.return_reason.update_success"),
          "success"
        )
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  const handleCancel = () => {
    reset({
      label: reason.label,
      description: reason.description,
    })
  }

  useEffect(() => {
    if (reason) {
      reset({
        label: reason.label,
        description: reason.description,
      })
    }
  }, [reason])

  return (
    <>
      <BodyCard
        actionables={[
          {
            label: t("settings.return_reason.duplicate"),
            icon: <DuplicateIcon size={20} />,
            onClick: () => handleOpenDuplicateModal(),
          },
          {
            label: t("settings.return_reason.detele_label"),
            variant: "danger",
            icon: <TrashIcon size={20} />,
            onClick: () => handleOpenPrompt(),
          },
        ]}
        events={[
          {
            label: t("common.save"),
            onClick: handleSubmit(onSave),
          },
          {
            label: t("common.cancel_change"),
            onClick: handleCancel,
          },
        ]}
        title={t("common.detail")}
        subtitle={reason?.value}
      >
        <form onSubmit={handleSubmit(onSave)}>
          <Input ref={register} name="label" label={t("common.label")} />
          <Input
            ref={register}
            name="description"
            label={t("common.description")}
            className="mt-base"
          />
        </form>
      </BodyCard>
      {showDuplicateModal && (
        <CreateReturnReasonModal
          initialReason={reason}
          handleClose={handleCloseDuplicateModal}
        />
      )}
      {showDanger && (
        <DeletePrompt
          heading={t("settings.return_reason.delete_heading")}
          text={t("settings.return_reason.delete_text")}
          handleClose={handleClosePrompt}
          onDelete={handleDeletion}
        />
      )}
    </>
  )
}

export default ReturnReasonDetail
