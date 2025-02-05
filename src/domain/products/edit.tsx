import { RouteComponentProps } from "@reach/router"
import { useAdminProduct, useAdminUpdateProduct } from "medusa-react"
import React, { useEffect, useState } from "react"
import { FieldValues } from "react-hook-form"
import toast from "react-hot-toast"
import Spinner from "../../components/atoms/spinner"
import Toaster from "../../components/declarative-toaster"
import FormToasterContainer from "../../components/molecules/form-toaster"
import useNotification from "../../hooks/use-notification"
import Medusa from "../../services/api"
import { consolidateImages } from "../../utils/consolidate-images"
import { getErrorMessage } from "../../utils/error-messages"
import { checkForDirtyState } from "../../utils/form-helpers"
import { handleFormError } from "../../utils/handle-form-error"
import ProductForm from "./product-form"
import { useTranslation } from "react-i18next"
import {
  formValuesToUpdateProductMapper,
  productToFormValuesMapper,
} from "./product-form/form/mappers"
import {
  ProductFormProvider,
  useProductForm,
} from "./product-form/form/product-form-context"

// type EditProductProps = {
//   id: string
// } & RouteComponentProps
const EditProductPage: React.FC<RouteComponentProps<{ id: string }>> = ({
  id,
}) => {
  id = id ?? ""
  const notification = useNotification()
  const { product, isLoading } = useAdminProduct(id, {
    keepPreviousData: true,
  })
  const { t } = useTranslation()
  const updateProduct = useAdminUpdateProduct(id)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (data) => {
    setSubmitting(true)
    const images = data.images
      .filter((img) => img.url.startsWith("blob"))
      .map((img) => img.nativeFile)

    let uploadedImgs = []
    if (images.length > 0) {
      uploadedImgs = await Medusa.uploads
        .create(images)
        .then(({ data }) => {
          const uploaded = data.uploads.map(({ url }) => url)
          return uploaded
        })
        .catch((err) => {
          setSubmitting(false)
          notification("Error uploading images", getErrorMessage(err), "error")
          return
        })
    }

    const newData = {
      ...data,
      images: consolidateImages(data.images, uploadedImgs),
    }

    updateProduct.mutate(formValuesToUpdateProductMapper(newData), {
      onSuccess: () => {
        setSubmitting(false)
        notification(
          t("common.status.success"),
          "Product updated successfully",
          "success"
        )
      },
      onError: (error) => {
        setSubmitting(false)
        notification(t("common.status.error"), getErrorMessage(error), "error")
      },
    })
  }

  return isLoading ? (
    <div className="w-full pt-2xlarge flex items-center justify-center">
      <Spinner size={"large"} variant={"secondary"} />
    </div>
  ) : (
    <ProductFormProvider
      product={productToFormValuesMapper(product)}
      onSubmit={onSubmit}
    >
      <ProductForm product={product} isEdit />
      <UpdateNotification isLoading={submitting} />
    </ProductFormProvider>
  )
}

const TOAST_ID = "edit-product-dirty"

const UpdateNotification = ({ isLoading = false }) => {
  const { t } = useTranslation()
  const {
    formState,
    onSubmit,
    handleSubmit,
    resetForm,
    additionalDirtyState,
  } = useProductForm()
  const [visible, setVisible] = useState(false)
  const [blocking, setBlocking] = useState(true)

  const onUpdate = (values: FieldValues) => {
    onSubmit({ ...values })
  }

  useEffect(() => {
    const timeout = setTimeout(setBlocking, 300, false)
    return () => clearTimeout(timeout)
  }, [])

  const isDirty = checkForDirtyState(
    formState.dirtyFields,
    additionalDirtyState
  )

  useEffect(() => {
    if (!blocking) {
      setVisible(isDirty)
    }

    return () => {
      toast.dismiss(TOAST_ID)
    }
  }, [isDirty])

  return (
    <Toaster
      visible={visible}
      duration={Infinity}
      id={TOAST_ID}
      position="bottom-right"
    >
      <FormToasterContainer isLoading={isLoading}>
        <FormToasterContainer.Actions>
          <FormToasterContainer.ActionButton
            onClick={handleSubmit(onUpdate, handleFormError)}
          >
            {t("common.save")}
          </FormToasterContainer.ActionButton>
          <FormToasterContainer.DiscardButton onClick={resetForm}>
            {t("common.discard")}
          </FormToasterContainer.DiscardButton>
        </FormToasterContainer.Actions>
      </FormToasterContainer>
    </Toaster>
  )
}

export default EditProductPage
