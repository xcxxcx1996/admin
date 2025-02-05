import {
  AdminPostOrdersOrderClaimsReq,
  Order,
  ProductVariant,
  ShippingOption,
} from "@medusajs/medusa"
import clsx from "clsx"
import {
  useAdminCreateClaim,
  useAdminOrder,
  useAdminRegion,
  useAdminShippingOptions,
} from "medusa-react"
import React, { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import Button from "../../../../components/fundamentals/button"
import CheckIcon from "../../../../components/fundamentals/icons/check-icon"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import IconTooltip from "../../../../components/molecules/icon-tooltip"
import Modal from "../../../../components/molecules/modal"
import LayeredModal, {
  LayeredModalContext,
} from "../../../../components/molecules/modal/layered-modal"
import RMAShippingPrice from "../../../../components/molecules/rma-select-shipping"
import Select from "../../../../components/molecules/select"
import CurrencyInput from "../../../../components/organisms/currency-input"
import RMAReturnProductsTable from "../../../../components/organisms/rma-return-product-table"
import RMASelectProductTable from "../../../../components/organisms/rma-select-product-table"
import useNotification from "../../../../hooks/use-notification"
import { Option } from "../../../../types/shared"
import { getErrorMessage } from "../../../../utils/error-messages"
import RMAEditAddressSubModal from "../rma-sub-modals/address"
import RMASelectProductSubModal from "../rma-sub-modals/products"
import { filterItems } from "../utils/create-filtering"

type ClaimMenuProps = {
  order: Omit<Order, "beforeInsert">
  onDismiss: () => void
}

type ReturnRecord = Record<
  string,
  {
    images: string[]
    note: string
    quantity: number
    reason: {
      label: string
      value?: "missing_item" | "wrong_item" | "production_failure" | "other"
    } | null
  }
>

type SelectProduct = Omit<ProductVariant & { quantity: number }, "beforeInsert">

type CustomPrice = {
  return?: number
  standard: number
}

type AddressPayload =
  | {
      address_1: string
      address_2: string
      city: string
      country_code: string
      first_name: string
      last_name: string
      phone: string
      postal_code: string
      province: string
    }
  | undefined

const reasonOptions = [
  {
    label: "Missing Item",
    value: "missing_item",
  },
  {
    label: "Wrong Item",
    value: "wrong_item",
  },
  {
    label: "Production Failure",
    value: "production_failure",
  },
  {
    label: "Other",
    value: "other",
  },
]

const ClaimMenu: React.FC<ClaimMenuProps> = ({ order, onDismiss }) => {
  const { mutate, isLoading } = useAdminCreateClaim(order.id)
  const { refetch } = useAdminOrder(order.id)
  const [shippingAddress, setShippingAddress] = useState<AddressPayload>(
    undefined
  )
  const [countries, setCountries] = useState<string[]>([])
  const [isReplace, toggleReplace] = useState(false)
  const [noNotification, setNoNotification] = useState(order.no_notification)
  const [toReturn, setToReturn] = useState<ReturnRecord>({})

  const [itemsToAdd, setItemsToAdd] = useState<SelectProduct[]>([])
  const [
    returnShippingMethod,
    setReturnShippingMethod,
  ] = useState<ShippingOption | null>(null)
  const [returnShippingPrice, setReturnShippingPrice] = useState<
    number | undefined
  >(undefined)
  const [shippingMethod, setShippingMethod] = useState<ShippingOption | null>(
    null
  )
  const [showCustomPrice, setShowCustomPrice] = useState({
    standard: false,
    return: false,
  })
  const [customOptionPrice, setCustomOptionPrice] = useState<CustomPrice>({
    standard: 0,
    return: undefined,
  })
  const [ready, setReady] = useState(false)

  const notification = useNotification()

  const layeredModalContext = useContext(LayeredModalContext)

  // Includes both order items and swap items
  const [allItems, setAllItems] = useState<any[]>([])
  const { t } = useTranslation()
  const formatAddress = (address) => {
    const addr = [address.address_1]
    if (address.address_2) {
      addr.push(address.address_2)
    }

    const city = `${address.postal_code} ${address.city}`

    return `${addr.join(", ")}, ${city}, ${address.country_code?.toUpperCase()}`
  }

  useEffect(() => {
    if (order) {
      setAllItems(filterItems(order, true))
    }
  }, [order])

  const { shipping_options: returnShippingOptions } = useAdminShippingOptions({
    is_return: true,
    region_id: order.region_id,
  })

  const { region } = useAdminRegion(order.region_id)

  useEffect(() => {
    if (region) {
      setCountries(region.countries.map((c) => c.iso_2))
    }
  }, [region])

  const { shipping_options: shippingOptions } = useAdminShippingOptions({
    region_id: order.region_id,
    is_return: false,
  })

  useEffect(() => {
    if (toReturn) {
      if (
        Object.keys(toReturn).length !== 0 &&
        isReplace &&
        itemsToAdd.length > 0 &&
        shippingMethod
      ) {
        setReady(true)
      } else if (!isReplace && Object.keys(toReturn).length !== 0) {
        setReady(true)
      } else {
        setReady(false)
      }
    } else {
      setReady(false)
    }
  }, [toReturn, isReplace, itemsToAdd, shippingMethod])

  useEffect(() => {
    if (!isReplace) {
      setShippingMethod(null)
      setShowCustomPrice({
        ...showCustomPrice,
        standard: false,
      })
    }
  }, [isReplace])

  useEffect(() => {
    setCustomOptionPrice({
      ...customOptionPrice,
      standard: 0,
    })
  }, [shippingMethod, showCustomPrice])

  useEffect(() => console.log(shippingAddress), [shippingAddress])

  const onSubmit = () => {
    const claim_items = Object.entries(toReturn).map(([key, value]) => {
      return {
        item_id: key,
        note: value.note ?? undefined,
        quantity: value.quantity,
        reason: value.reason?.value,
      }
    })

    const data: AdminPostOrdersOrderClaimsReq = {
      type: isReplace ? "replace" : "refund",
      claim_items,
      additional_items: itemsToAdd.map((i) => ({
        variant_id: i.id,
        quantity: i.quantity,
      })),
      no_notification:
        noNotification !== order.no_notification ? noNotification : undefined,
    }

    if (shippingAddress) {
      data.shipping_address = shippingAddress
    }

    if (returnShippingMethod) {
      data.return_shipping = {
        option_id: returnShippingMethod.id,
        price:
          showCustomPrice.return && customOptionPrice.return
            ? customOptionPrice.return * 100
            : Math.round(
                returnShippingPrice || 0 / (1 + (order.tax_rate || 0 / 100))
              ),
      }
    }

    if (shippingMethod) {
      data.shipping_methods = [
        {
          option_id: shippingMethod.id,
          price: customOptionPrice.standard * 100,
        },
      ]
    }

    mutate(data, {
      onSuccess: () => {
        refetch()
        notification(
          t("common.status.success"),
          t("orders.notification.create_claim_success"),
          "success"
        )
        onDismiss()
      },
      onError: (error) => {
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  const handleToAddQuantity = (value: number, index: number) => {
    const updated = [...itemsToAdd]
    updated[index] = {
      ...itemsToAdd[index],
      quantity: itemsToAdd[index].quantity + value,
    }

    setItemsToAdd(updated)
  }

  const handleRemoveItem = (index) => {
    const updated = [...itemsToAdd]
    updated.splice(index, 1)
    setItemsToAdd(updated)
  }

  const handleReturnShippingSelected = (so: Option) => {
    if (!so) {
      setReturnShippingMethod(null)
      return
    }

    const selectSo = returnShippingOptions?.find((s) => so.value === s.id)
    if (selectSo) {
      setReturnShippingMethod(selectSo)
      setReturnShippingPrice(
        selectSo.amount * (1 + (order.tax_rate || 0 / 100))
      )
    } else {
      setReturnShippingMethod(null)
      setReturnShippingPrice(0)
    }
  }

  const handleShippingSelected = (so: Option) => {
    const selectSo = shippingOptions?.find((s) => so.value === s.id)
    if (selectSo) {
      setShippingMethod(selectSo)
    } else {
      setShippingMethod(null)
    }
  }

  const handleProductSelect = (variants: SelectProduct[]) => {
    const existingIds = itemsToAdd.map((i) => i.id)

    setItemsToAdd((itemsToAdd) => [
      ...itemsToAdd,
      ...variants
        .filter((variant) => !existingIds.includes(variant.id))
        .map((variant) => ({ ...variant, quantity: 1 })),
    ])
  }

  return (
    <LayeredModal context={layeredModalContext} handleClose={onDismiss}>
      <Modal.Body>
        <Modal.Header handleClose={onDismiss}>
          <h2 className="inter-xlarge-semibold">Create Claim</h2>
        </Modal.Header>
        <Modal.Content>
          <div>
            <h3 className="inter-base-semibold">Items to claim</h3>
            <RMASelectProductTable
              order={order}
              allItems={allItems}
              imagesOnReturns={true}
              customReturnOptions={reasonOptions}
              toReturn={toReturn}
              setToReturn={(items) => setToReturn(items)}
            />
          </div>
          <div className="mt-4">
            <h3 className="inter-base-semibold">
              {t("orders.field.shipping_return")}
              {returnShippingMethod && (
                <span className="text-grey-40 inter-base-regular">
                  ({returnShippingMethod.region.name})
                </span>
              )}
            </h3>
            <Select
              clearSelected
              label={t("orders.field.shipping_method")}
              className="mt-2"
              placeholder="Add a shipping method"
              value={
                returnShippingMethod
                  ? {
                      label: returnShippingMethod.name,
                      value: returnShippingMethod.id,
                    }
                  : null
              }
              onChange={handleReturnShippingSelected}
              options={
                returnShippingOptions?.map((o) => ({
                  label: o.name,
                  value: o.id,
                })) || []
              }
            />
            {returnShippingMethod && (
              <RMAShippingPrice
                useCustomShippingPrice={showCustomPrice.return}
                shippingPrice={customOptionPrice.return || undefined}
                currencyCode={returnShippingMethod.region.currency_code}
                updateShippingPrice={(value) =>
                  setCustomOptionPrice({
                    ...customOptionPrice,
                    return: value,
                  })
                }
                setUseCustomShippingPrice={(value) => {
                  setCustomOptionPrice({
                    ...customOptionPrice,
                    return: returnShippingMethod.amount,
                  })

                  setShowCustomPrice({
                    ...showCustomPrice,
                    return: value,
                  })
                }}
              />
            )}
          </div>
          <div className="flex w-full mt-4 items-center inter-base-regular gap-x-xlarge">
            <div
              className="cursor-pointer items-center flex"
              onClick={() => {
                toggleReplace(true)
              }}
            >
              <div
                className={clsx(
                  "rounded-full w-5 h-5 flex mr-3 items-center justify-center",
                  {
                    "border-violet-60 border-2": isReplace,
                    "border-grey-40 border": !isReplace,
                  }
                )}
              >
                {isReplace && (
                  <div className="w-3 h-3 bg-violet-60 rounded-full"></div>
                )}
              </div>
              {t("orders.actions.replace")}
            </div>
            <div
              className="cursor-pointer items-center flex"
              onClick={() => {
                toggleReplace(false)
              }}
            >
              <div
                className={clsx(
                  "rounded-full w-5 h-5 flex mr-3 items-center justify-center",
                  {
                    "border-violet-60 border-2": !isReplace,
                    "border-grey-40 border": isReplace,
                  }
                )}
              >
                {!isReplace && (
                  <div className="w-3 h-3 bg-violet-60 rounded-full"></div>
                )}
              </div>
              Refund
            </div>
          </div>
          {isReplace && (
            <div className="mt-8">
              <div className="flex justify-between items-center">
                <h3 className="inter-base-semibold ">{t("orders.field.item_to_send")}</h3>
                {itemsToAdd.length === 0 ? (
                  <Button
                    variant="ghost"
                    className="border border-grey-20"
                    size="small"
                    onClick={() => {
                      layeredModalContext.push(
                        SelectProductsScreen(
                          layeredModalContext.pop,
                          itemsToAdd,
                          handleProductSelect
                        )
                      )
                    }}
                  >
                    {t("orders.actions.add_product")}
                  </Button>
                ) : (
                  <></>
                )}
              </div>
              {itemsToAdd.length > 0 && (
                <>
                  <RMAReturnProductsTable
                    order={order}
                    itemsToAdd={itemsToAdd}
                    handleRemoveItem={handleRemoveItem}
                    handleToAddQuantity={handleToAddQuantity}
                  />

                  <div className="flex w-full justify-end">
                    <Button
                      variant="ghost"
                      className="border border-grey-20"
                      size="small"
                      onClick={() => {
                        layeredModalContext.push(
                          SelectProductsScreen(
                            layeredModalContext.pop,
                            itemsToAdd,
                            handleProductSelect
                          )
                        )
                      }}
                    >
                      {t("orders.actions.add_product")}
                    </Button>
                  </div>
                </>
              )}
              <div className="mt-8">
                <span className="inter-base-semibold">
                  {t("orders.field.shipping_address")}
                </span>
                {shippingAddress ? (
                  <>
                    <div className="flex w-full inter-small-regular text-grey-50">
                      {formatAddress(shippingAddress)}
                    </div>
                    <div className="flex w-full justify-end">
                      <Button
                        onClick={() => {
                          layeredModalContext.push(
                            showEditAddressScreen(
                              layeredModalContext.pop,
                              shippingAddress,
                              order,
                              countries,
                              setShippingAddress
                            )
                          )
                        }}
                        variant="ghost"
                        size="small"
                        className="border border-grey-20"
                      >
                        {t("common.edit")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div>
                    <span className="flex w-full inter-small-regular text-grey-50">
                      {formatAddress(order.shipping_address)}
                    </span>
                    <div className="flex w-full justify-end">
                      <Button
                        onClick={() => {
                          layeredModalContext.push(
                            showEditAddressScreen(
                              layeredModalContext.pop,
                              order.shipping_address,
                              order,
                              countries,
                              setShippingAddress
                            )
                          )
                        }}
                        variant="ghost"
                        size="small"
                        className="border border-grey-20"
                      >
                        {t("orders.actions.ship_to_different")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <h3 className="inter-base-semibold mt-8">
                  {t("orders.actions.ship_new")}
                </h3>
                <span className="inter-small-regular text-grey-50">
                  {t("orders.description.ship_new")}
                </span>
                <Select
                  label={t("orders.field.shipping_method")}
                  className="mt-2"
                  placeholder="Add a shipping method"
                  value={
                    shippingMethod
                      ? {
                          label: shippingMethod?.name,
                          value: shippingMethod?.id,
                        }
                      : null
                  }
                  onChange={handleShippingSelected}
                  options={
                    shippingOptions?.map((o) => ({
                      label: o.name,
                      value: o.id,
                    })) || []
                  }
                />
                <div>
                  {shippingMethod ? (
                    <>
                      <div className="flex justify-end w-full">
                        {!showCustomPrice.standard && (
                          <Button
                            variant="ghost"
                            size="small"
                            className="border border-grey-20 mt-4 "
                            disabled={!shippingMethod}
                            onClick={() =>
                              setShowCustomPrice({
                                ...showCustomPrice,
                                standard: true,
                              })
                            }
                          >
                            {showCustomPrice.standard
                              ? t("orders.actions.submit")
                              : "Set custom price"}
                          </Button>
                        )}
                        {showCustomPrice.standard && (
                          <div className="flex w-full items-center">
                            <CurrencyInput
                              readOnly
                              className="mt-4 w-full"
                              size="small"
                              currentCurrency={order.currency_code}
                            >
                              <CurrencyInput.AmountInput
                                label={"Amount"}
                                amount={customOptionPrice.standard}
                                onChange={(value) =>
                                  setCustomOptionPrice({
                                    ...customOptionPrice,
                                    standard: value || 0,
                                  })
                                }
                              />
                            </CurrencyInput>
                            <Button
                              onClick={() =>
                                setShowCustomPrice({
                                  ...showCustomPrice,
                                  standard: false,
                                })
                              }
                              className="w-8 h-8 ml-8 text-grey-40"
                              variant="ghost"
                              size="small"
                            >
                              <TrashIcon size={20} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </Modal.Content>
        <Modal.Footer>
          <div className="flex w-full justify-between">
            <div
              className="items-center h-full flex cursor-pointer"
              onClick={() => setNoNotification(!noNotification)}
            >
              <div
                className={`w-5 h-5 flex justify-center text-grey-0 border-grey-30 border rounded-base ${
                  !noNotification && "bg-violet-60"
                }`}
              >
                <span className="self-center">
                  {!noNotification && <CheckIcon size={16} />}
                </span>
              </div>
              <input
                id="noNotification"
                className="hidden"
                name="noNotification"
                checked={!noNotification}
                onChange={() => setNoNotification(!noNotification)}
                type="checkbox"
              />
              <span className="ml-3 flex items-center text-grey-90 gap-x-xsmall">
                {t("orders.actions.send_notification")}
                <IconTooltip content="Notify customer of created return" />
              </span>
            </div>
            <div className="flex gap-x-xsmall">
              <Button
                onClick={() => onDismiss()}
                className="w-[112px]"
                type="submit"
                size="small"
                variant="ghost"
              >
                {t("common.back")}
              </Button>
              <Button
                onClick={onSubmit}
                disabled={!ready}
                loading={isLoading}
                className="w-[112px]"
                size="small"
                variant="primary"
              >
                {t("orders.actions.complete")}
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </LayeredModal>
  )
}

const SelectProductsScreen = (pop, itemsToAdd, setSelectedItems) => {
  return {
    title: "Add Products",
    onBack: () => pop(),
    view: (
      <RMASelectProductSubModal
        selectedItems={itemsToAdd || []}
        onSubmit={setSelectedItems}
      />
    ),
  }
}

const showEditAddressScreen = (
  pop,
  address,
  order,
  countries,
  setShippingAddress
) => {
  return {
    title: "Edit Address",
    onBack: () => pop(),
    view: (
      <RMAEditAddressSubModal
        onSubmit={setShippingAddress}
        address={address}
        order={order}
        countries={countries}
      />
    ),
  }
}

export default ClaimMenu
