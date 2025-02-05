import { MoneyAmount, Product } from "@medusajs/medusa"
import { useAdminStore, useAdminUpdatePriceList } from "medusa-react"
import * as React from "react"
import Button from "../../../../../../components/fundamentals/button"
import { CollapsibleTree } from "../../../../../../components/molecules/collapsible-tree"
import Modal from "../../../../../../components/molecules/modal"
import LayeredModal, {
  useLayeredModal,
} from "../../../../../../components/molecules/modal/layered-modal"
import PriceOverrides from "../../../../../../components/templates/price-overrides"
import ProductVariantLeaf from "./product-variant-leaf"
import { useParams } from "@reach/router"
import { mapToPriceList } from "./mappers"
import { mergeExistingWithDefault } from "../../../utils"
import { useTranslation } from "react-i18next"

type EditPricesOverridesModalProps = {
  product: Product
  close: () => void
}

const EditPricesOverridesModal = ({
  close,
  product,
}: EditPricesOverridesModalProps) => {
  const { t } = useTranslation()
  const context = useLayeredModal()
  const { id: priceListId } = useParams()
  const updatePriceList = useAdminUpdatePriceList(priceListId)
  const { store } = useAdminStore()

  const defaultPrices = store?.currencies.map((curr) => ({
    currency_code: curr.code,
    amount: 0,
  })) as MoneyAmount[]

  const getOnClick = (variant) => () =>
    context.push({
      title: `Edit price overrides`,
      onBack: () => context.pop(),
      view: (
        <PriceOverrides
          prices={mergeExistingWithDefault(
            variant.prices.filter((pr) => pr.price_list_id),
            defaultPrices
          )}
          isEdit
          defaultVariant={variant}
          variants={product.variants}
          onClose={close}
          onSubmit={(values) => {
            const updatedPrices = mapToPriceList(values, variant.id)

            updatePriceList.mutate(
              {
                prices: updatedPrices,
              },
              {
                onSuccess: () => {
                  context.pop()
                  close()
                },
              }
            )
          }}
        />
      ),
    })

  return (
    <LayeredModal isLargeModal context={context} handleClose={close}>
      <Modal.Body className="h-[calc(100vh-134px)] flex flex-col">
        <Modal.Header handleClose={close}>
          <h1 className="inter-xlarge-semibold">
            Price overrides{" "}
            <span className="text-grey-50 inter-xlarge-regular truncate">
              ({product.title})
            </span>
          </h1>
        </Modal.Header>

        <Modal.Content className="flex-1">
          <CollapsibleTree>
            <CollapsibleTree.Parent>
              <div>
                <img src={product.thumbnail} className="w-4 h-5 rounded-base" />
              </div>
              <span className="inter-small-semibold">{product.title}</span>
            </CollapsibleTree.Parent>
            <CollapsibleTree.Content>
              {product.variants.map((variant) => (
                <CollapsibleTree.Leaf>
                  <ProductVariantLeaf
                    key={variant.id}
                    onClick={getOnClick(variant)}
                    variant={variant}
                    prices={variant.prices.filter((pr) => pr.price_list_id)}
                  />
                </CollapsibleTree.Leaf>
              ))}
            </CollapsibleTree.Content>
          </CollapsibleTree>
        </Modal.Content>

        <Modal.Footer>
          <div className="flex w-full h-8 justify-end">
            <Button
              variant="ghost"
              className="mr-2 w-32 text-small justify-center rounded-rounded"
              size="large"
              onClick={close}
            >
              {t("common.cancel")}
            </Button>
            <Button
              disabled
              size="large"
              className="w-32 text-small justify-center rounded-rounded"
              variant="primary"
            >
              {t("common.save")}
            </Button>
          </div>
        </Modal.Footer>
      </Modal.Body>
    </LayeredModal>
  )
}

export default EditPricesOverridesModal
