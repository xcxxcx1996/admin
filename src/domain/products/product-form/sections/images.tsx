import React from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import FileUploadField from "../../../../components/atoms/file-upload-field"
import BodyCard from "../../../../components/organisms/body-card"
import RadioGroup from "../../../../components/organisms/radio-group"
import DraggableTable from "../../../../components/templates/draggable-table"
import { useProductForm } from "../form/product-form-context"

const Images = () => {
  const {
    images,
    setImages,
    appendImage,
    removeImage,
    control,
  } = useProductForm()
  const { t } = useTranslation()
  const columns = [
    {
      Header: t("products.images.image_header"),
      accessor: "image",
      Cell: ({ cell }) => {
        return (
          <div className="py-base large:w-[176px] xsmall:w-[80px]">
            <img
              className="h-[80px] w-[80px] object-cover rounded"
              src={cell.row.original.url}
            />
          </div>
        )
      },
    },
    {
      Header: t("products.images.file_name_header"),
      accessor: "name",
      Cell: ({ cell }) => {
        return (
          <div className="large:w-[700px] medium:w-[400px] small:w-auto">
            <p className="inter-small-regular">{cell.row.original?.name}</p>
            <span className="inter-small-regular text-grey-50">
              {typeof cell.row.original.size === "number"
                ? `${(cell.row.original.size / 1024).toFixed(2)} KB`
                : cell.row.original?.size}
            </span>
          </div>
        )
      },
    },
    {
      Header: (
        <div className="text-center">
          {t("products.images.thumbnail_header")}
        </div>
      ),
      accessor: "thumbnail",
      Cell: ({ cell }) => {
        return (
          <div className="flex justify-center">
            <RadioGroup.SimpleItem
              className="justify-center"
              value={cell.row.original.url}
            />
          </div>
        )
      },
    },
  ]
  return (
    <BodyCard title="Images" subtitle={t("products.images.subtitle")}>
      <div className="mt-base">
        <Controller
          name="thumbnail"
          control={control}
          render={({ value, onChange }) => {
            return (
              <RadioGroup.Root
                value={value}
                onValueChange={(value) => {
                  onChange(value)
                }}
              >
                <DraggableTable
                  onDelete={removeImage}
                  columns={columns}
                  entities={images}
                  setEntities={setImages}
                />
              </RadioGroup.Root>
            )
          }}
        />
      </div>
      <div className="mt-2xlarge">
        <FileUploadField
          onFileChosen={(files) => {
            const file = files[0]
            const url = URL.createObjectURL(file)
            appendImage({
              url,
              name: file.name,
              size: file.size,
              nativeFile: file,
            })
          }}
          placeholder={t("products.images.placeholder")}
          filetypes={["png", "jpg", "jpeg"]}
          className="py-large"
        />
      </div>
    </BodyCard>
  )
}

export default Images
