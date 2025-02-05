import React, { useContext, useEffect, useState } from "react"
import { difference } from "lodash"
import { navigate } from "gatsby"
import { CustomerGroup } from "@medusajs/medusa"
import {
  useAdminAddCustomersToCustomerGroup,
  useAdminCustomerGroup,
  useAdminCustomerGroupCustomers,
  useAdminDeleteCustomerGroup,
  useAdminRemoveCustomersFromCustomerGroup,
} from "medusa-react"

import Breadcrumb from "../../../components/molecules/breadcrumb"
import BodyCard from "../../../components/organisms/body-card"
import EditIcon from "../../../components/fundamentals/icons/edit-icon"
import TrashIcon from "../../../components/fundamentals/icons/trash-icon"
import PlusIcon from "../../../components/fundamentals/icons/plus-icon"
import EditCustomersTable from "../../../components/templates/customer-group-table/edit-customers-table"
import CustomersListTable from "../../../components/templates/customer-group-table/customers-list-table"
import CustomerGroupContext, {
  CustomerGroupContextContainer,
} from "./context/customer-group-context"
import useQueryFilters from "../../../hooks/use-query-filters"
import DeletePrompt from "../../../components/organisms/delete-prompt"
import { useTranslation } from "react-i18next"

/**
 * Default filtering config for querying customer group customers list endpoint.
 */
const defaultQueryProps = {
  additionalFilters: { expand: "groups" },
  limit: 15,
  offset: 0,
}

/*
 * Placeholder for the customer groups list.
 */
function CustomersListPlaceholder() {
  return (
    <div className="h-full flex center justify-center items-center min-h-[756px]">
      <span className="text-xs text-gray-400">
        No customers in this group yet
      </span>
    </div>
  )
}

type CustomerGroupCustomersListProps = { group: CustomerGroup }

/*
 * Customer groups list container.
 */
function CustomerGroupCustomersList(props: CustomerGroupCustomersListProps) {
  const groupId = props.group.id

  // toggle to show/hide "edit customers" modal
  const [showCustomersModal, setShowCustomersModal] = useState(false)

  const { q, queryObject, paginate, setQuery } = useQueryFilters(
    defaultQueryProps
  )

  const { customers = [], isLoading, count } = useAdminCustomerGroupCustomers(
    groupId,
    queryObject
  )
  const { t } = useTranslation()

  const { mutate: addCustomers } = useAdminAddCustomersToCustomerGroup(groupId)
  const { mutate: removeCustomers } = useAdminRemoveCustomersFromCustomerGroup(
    groupId
  )

  // list of currently selected customers of a group
  const [selectedCustomerIds, setSelectedCustomerIds] = useState(
    customers.map((c) => c.id)
  )

  useEffect(() => {
    if (!isLoading) {
      setSelectedCustomerIds(customers.map((c) => c.id))
    }
  }, [isLoading, customers])

  const showPlaceholder = !isLoading && !customers.length && !q

  const actions = [
    {
      label: t("customer.groups.edit"),
      onClick: () => setShowCustomersModal(true),
      icon: (
        <span className="text-grey-90">
          <PlusIcon size={20} />
        </span>
      ),
    },
  ]

  /*
   * Calculate which customers need to be added/removed.
   */
  const calculateDiff = () => {
    const initialIds = customers.map((c) => c.id)
    return {
      toAdd: difference(selectedCustomerIds, initialIds),
      toRemove: difference(initialIds, selectedCustomerIds),
    }
  }

  /**
   * Handle "edit customers" modal form submit.
   */
  const handleSubmit = () => {
    const { toAdd, toRemove } = calculateDiff()

    if (toAdd.length) {
      addCustomers({ customer_ids: toAdd.map((i) => ({ id: i })) })
    }
    if (toRemove.length) {
      removeCustomers({ customer_ids: toRemove.map((i) => ({ id: i })) })
    }

    setShowCustomersModal(false)
  }

  return (
    <BodyCard
      title={t("customers.title")}
      actionables={actions}
      className="min-h-0 w-full my-4 min-h-[756px]"
    >
      {showCustomersModal && (
        <EditCustomersTable
          selectedCustomerIds={selectedCustomerIds}
          setSelectedCustomerIds={setSelectedCustomerIds}
          handleSubmit={handleSubmit}
          onClose={() => setShowCustomersModal(false)}
        />
      )}

      {showPlaceholder ? (
        <CustomersListPlaceholder />
      ) : (
        <CustomersListTable
          query={q}
          count={count || 0}
          paginate={paginate}
          setQuery={setQuery}
          customers={customers}
          groupId={props.group.id}
          queryObject={queryObject}
          removeCustomers={removeCustomers}
        />
      )}
    </BodyCard>
  )
}

type CustomerGroupDetailsHeaderProps = {
  customerGroup: CustomerGroup
}

/*
 * Customers groups details page header.
 */
function CustomerGroupDetailsHeader(props: CustomerGroupDetailsHeaderProps) {
  const { showModal } = useContext(CustomerGroupContext)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)

  const { mutate: deleteGroup } = useAdminDeleteCustomerGroup(
    props.customerGroup.id
  )
  const { t } = useTranslation()
  const actions = [
    {
      label: t("common.edit"),
      onClick: showModal,
      icon: <EditIcon size={20} />,
    },
    {
      label: t("common.delete"),
      onClick: () => {
        setShowDeleteConfirmation(true)
      },
      variant: "danger",
      icon: <TrashIcon size={20} />,
    },
  ]

  const onDeleteConfirmed = async () => {
    deleteGroup()
    navigate("/a/customers/groups")
  }

  const handleConfirmDialogClose = () => setShowDeleteConfirmation(false)

  return (
    <>
      <BodyCard
        title={props.customerGroup.name}
        actionables={actions}
        className="min-h-0 w-full"
        subtitle={" "}
      />
      {showDeleteConfirmation && (
        <DeletePrompt
          onDelete={onDeleteConfirmed}
          handleClose={handleConfirmDialogClose}
          confirmText={t("customers.groups.delete_confirm")}
          heading={t("customers.groups.delete")}
          successText={t("customers.groups.delete_success")}
          text={t("customers.groups.delete_text")}
        />
      )}
    </>
  )
}

type CustomerGroupDetailsProps = { id: string }

/*
 * Customer groups details page
 */
function CustomerGroupDetails(p: CustomerGroupDetailsProps) {
  const { customer_group } = useAdminCustomerGroup(p.id)
  const { t } = useTranslation()

  if (!customer_group) {
    return null
  }

  return (
    <CustomerGroupContextContainer group={customer_group}>
      <div className="-mt-4 pb-4">
        <Breadcrumb
          currentPage={
            customer_group ? customer_group.name : t("customers.groups.title")
          }
          previousBreadcrumb="Groups"
          previousRoute="/a/customers/groups"
        />
        <CustomerGroupDetailsHeader customerGroup={customer_group} />
        <CustomerGroupCustomersList group={customer_group} />
      </div>
    </CustomerGroupContextContainer>
  )
}

export default CustomerGroupDetails
