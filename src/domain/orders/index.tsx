import { RouteComponentProps, Router } from "@reach/router"
import { navigate } from "gatsby"
import { useAdminCreateBatchJob } from "medusa-react"
import React, { useMemo } from "react"
import Button from "../../components/fundamentals/button"
import ExportIcon from "../../components/fundamentals/icons/export-icon"
import BodyCard from "../../components/organisms/body-card"
import TableViewHeader from "../../components/organisms/custom-table-header"
import ExportModal from "../../components/organisms/export-modal"
import OrderTable from "../../components/templates/order-table"
import useNotification from "../../hooks/use-notification"
import useToggleState from "../../hooks/use-toggle-state"
import { getErrorMessage } from "../../utils/error-messages"
import Details from "./details"
import { useTranslation } from "react-i18next"

const VIEWS = ["orders", "drafts"]

const OrderIndex: React.FC<RouteComponentProps> = () => {
  const view = "orders"
  const { t } = useTranslation()
  const createBatchJob = useAdminCreateBatchJob()
  const notification = useNotification()

  const {
    open: openExportModal,
    close: closeExportModal,
    state: exportModalOpen,
  } = useToggleState(false)

  const actions = useMemo(() => {
    return [
      <Button
        variant="secondary"
        size="small"
        onClick={() => openExportModal()}
      >
        <ExportIcon size={20} />
        {t("orders.actions.export")}
      </Button>,
    ]
  }, [view])

  const handleCreateExport = () => {
    const reqObj = {
      type: "order-export",
      context: {},
      dry_run: false,
    }

    createBatchJob.mutate(reqObj, {
      onSuccess: () => {
        notification(
          t("common.status.success"),
          t("orders.notification.export_success"),
          "success"
        )
      },
      onError: (err) => {
        notification(t("common.status.error"), getErrorMessage(err), "error")
      },
    })

    closeExportModal()
  }

  return (
    <>
      <div className="flex flex-col grow h-full">
        <div className="w-full flex flex-col grow">
          <BodyCard
            customHeader={
              <TableViewHeader
                views={VIEWS}
                setActiveView={(v) => {
                  if (v === "drafts") {
                    navigate(`/a/draft-orders`)
                  }
                }}
                activeView={view}
              />
            }
            customActionable={actions}
          >
            <OrderTable />
          </BodyCard>
        </div>
      </div>
      {exportModalOpen && (
        <ExportModal
          title={t("orders.actions.export")}
          handleClose={() => closeExportModal()}
          onSubmit={handleCreateExport}
          loading={createBatchJob.isLoading}
        />
      )}
    </>
  )
}

const Orders = () => {
  return (
    <Router>
      <OrderIndex path="/" />
      <Details path=":id" />
    </Router>
  )
}

export default Orders
