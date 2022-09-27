import { useAdminStore, useAdminUpdateStore } from "medusa-react"
import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import BreadCrumb from "../../components/molecules/breadcrumb"
import Input from "../../components/molecules/input"
import BodyCard from "../../components/organisms/body-card"
import useNotification from "../../hooks/use-notification"
import { getErrorMessage } from "../../utils/error-messages"
import { useTranslation } from "react-i18next"
const Docker = require("dockerode")
const dockerHostIP = "192.168.188.108"
const dockerHostPort = 4243
const docker = new Docker({ host: dockerHostIP, port: dockerHostPort })
docker.listContainers({ all: true }, function (err, containers) {
  console.log("Total number of containers: " + containers.length)
  containers.forEach(function (container) {
    console.log(
      `Container ${container.Names} - current status ${container.Status} - based on image ${container.Image}`
    )
  })
})
// create a container entity. does not query API
async function startStop(containerId) {
  const container = await docker.getContainer(containerId)
  try {
    const data = await container.inspect()
    console.log("Inspected container " + JSON.stringify(data))
    const started = await container.start()
    console.log("Started " + started)
    const stopped = await container.stop()
    console.log("Stopped " + stopped)
  } catch (err) {
    console.log(err)
  }
}

const AccountDetails = () => {
  const { t } = useTranslation()
  const { register, reset, handleSubmit } = useForm()
  const { store, isSuccess } = useAdminStore()
  const updateStore = useAdminUpdateStore()
  const notification = useNotification()
  useEffect(() => {
    if (!isSuccess) {
      return
    }
    reset({
      name: store?.name,
      swap_link_template: store?.swap_link_template,
      payment_link_template: store?.payment_link_template,
      invite_link_template: store?.invite_link_template,
    })
  }, [store, isSuccess, reset])

  const handleCancel = () => {
    reset({
      name: store?.name,
      swap_link_template: store?.swap_link_template,
      payment_link_template: store?.payment_link_template,
      invite_link_template: store?.invite_link_template,
    })
  }

  const onSubmit = (data) => {
    if (
      !validateUrl(data.swap_link_template) ||
      !validateUrl(data.payment_link_template) ||
      !validateUrl(data.invite_link_template)
    ) {
      notification(t("common.status.error"), "Malformed url", "error")
      return
    }
    updateStore.mutate(data, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          t("settings.store.update_success"),
          "success"
        )
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  return (
    <form className="flex-col py-5">
      <div className="max-w-[632px]">
        <BreadCrumb
          previousRoute="/a/settings/"
          previousBreadcrumb={t("settings.title")}
          currentPage={t("settings.store.title")}
        />
        <BodyCard
          events={[
            {
              label: t("common.publish") + "（待受权限）",
              type: "button",
              onClick: handleSubmit(onSubmit),
            },
          ]}
          title={"前端网页控制台"}
          subtitle="每次修改将在发布后更新，发布时间大约在10min，发布过程将导致前端网页无法浏览"
        ></BodyCard>

        <BodyCard
          events={[
            {
              label: t("common.save"),
              type: "button",
              onClick: handleSubmit(onSubmit),
            },
            {
              label: t("common.cancel_change"),
              type: "button",
              onClick: handleCancel,
            },
          ]}
          title={t("settings.store.title")}
          subtitle="管理商店详情"
        >
          <h6 className="mt-large inter-base-semibold">
            {t("common.general")}
          </h6>
          <Input
            className="mt-base"
            label={t("settings.store.name")}
            name="name"
            placeholder="云九鼎"
            ref={register}
          />
          <h6 className="mt-2xlarge inter-base-semibold">
            {t("settings.advance")}
          </h6>
          <Input
            className="mt-base"
            label={t("settings.store.swap_link_template")}
            name="swap_link_template"
            placeholder="https://acme.inc/swap"
            ref={register}
          />
          <Input
            className="mt-base"
            label={t("settings.store.payment_link_template")}
            name="payment_link_template"
            placeholder="https://acme.inc/swap"
            ref={register}
          />
          <Input
            className="mt-base"
            label={t("settings.store.invite_link_template")}
            name="invite_link_template"
            placeholder="https://acme.inc/invite={invite_token}"
            ref={register}
          />
        </BodyCard>
      </div>
    </form>
  )
}

const validateUrl = (address) => {
  if (!address || address === "") {
    return true
  }

  try {
    const url = new URL(address)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch (_) {
    return false
  }
}

export default AccountDetails
