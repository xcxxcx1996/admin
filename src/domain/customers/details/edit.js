import { useAdminUpdateCustomer } from "medusa-react"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Button from "../../../components/fundamentals/button"
import InputField from "../../../components/molecules/input"
import Modal from "../../../components/molecules/modal"
import useNotification from "../../../hooks/use-notification"
import { getErrorMessage } from "../../../utils/error-messages"

const EditCustomerModal = ({ handleClose, customer }) => {
  const { register, reset, handleSubmit } = useForm()

  const notification = useNotification()

  const updateCustomer = useAdminUpdateCustomer(customer.id)
  const { t } = useTranslation()
  const submit = (data) => {
    updateCustomer.mutate(data, {
      onSuccess: () => {
        handleClose()
        notification(
          t("common.status.success"),
          t("customers.update_success"),
          "success"
        )
      },
      onError: (err) => {
        handleClose()
        notification(t("common.status.error"), getErrorMessage(err), "error")
      },
    })
  }

  useEffect(() => {
    reset({
      first_name: customer.first_name || "",
      last_name: customer.last_name || "",
      email: customer.email,
      phone: customer.phone || "",
    })
  }, [])

  return (
    <Modal handleClose={handleClose}>
      <Modal.Body>
        <Modal.Header handleClose={handleClose}>
          <span className="inter-xlarge-semibold">{t("customers.edit")}</span>
        </Modal.Header>
        <Modal.Content>
          <div className="inter-base-semibold text-grey-90 mb-4">
            {t("common.general")}
          </div>
          <div className="w-full flex mb-4 space-x-2">
            <InputField
              label={t("customer.first_name")}
              name="first_name"
              placeholder="Lebron"
              ref={register}
            />
            <InputField
              label={t("customer.last_name")}
              name="last_name"
              placeholder="James"
              ref={register}
            />
          </div>
          <div className="inter-base-semibold text-grey-90 mb-4">
            {t("customer.contact")}
          </div>
          <div className="flex space-x-2">
            <InputField
              label={t("customer.email")}
              name="email"
              disabled
              ref={register}
            />
            <InputField
              label={t("customer.phone")}
              name="phone"
              placeholder="+45 42 42 42 42"
              ref={register}
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <div className="w-full flex justify-end">
            <Button
              variant="ghost"
              size="small"
              onClick={handleClose}
              className="mr-2"
            >
              {t("common.cancel")}
            </Button>
            <Button
              loading={updateCustomer.isLoading}
              variant="primary"
              className="min-w-[100px]"
              size="small"
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

export default EditCustomerModal
