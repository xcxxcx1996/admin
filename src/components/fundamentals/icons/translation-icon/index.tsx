import React from "react"
import IconProps from "../types/icon-type"

const TranslationIcon: React.FC<IconProps> = ({
  size = "24",
  color = "currentColor",
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        // stroke={color}
        // strokeWidth="1.5"
        // strokeLinecap="round"
        // strokeLinejoin="round"
        d="M5.65092 18.3538L6.18814 15.9803L5.83266 15.3207C5.45189 14.6142 5.18886 13.8345 5.07064 13.0059H8.03103C8.14673 14.8686 8.58594 16.7188 9.34866 18.4869C9.1204 18.3934 8.89825 18.2882 8.68291 18.172L8.02264 17.8158L5.65092 18.3538ZM10.0354 13.0059C10.1814 15.0638 10.7786 17.1026 11.8269 19.0038C11.8844 19.0052 11.9421 19.0059 12 19.0059C12.1441 19.0059 12.2871 19.0015 12.4291 18.9929C13.4737 17.0949 14.0688 15.0599 14.2146 13.0059H10.0354ZM14.2146 11.0059H10.0354C10.1814 8.94788 10.7786 6.90908 11.8269 5.00796C11.8844 5.00656 11.9421 5.00586 12 5.00586C12.1441 5.00586 12.2872 5.01021 12.4291 5.0188C13.4737 6.91683 14.0688 8.95179 14.2146 11.0059ZM16.219 13.0059C16.1062 14.8211 15.6862 16.6245 14.959 18.3515C17.0575 17.3713 18.5894 15.3809 18.9291 13.0059H16.219ZM18.9291 11.0059H16.219C16.1062 9.19064 15.6863 7.38726 14.9591 5.6602C17.0575 6.6404 18.5894 8.63084 18.9291 11.0059ZM8.03103 11.0059H5.07089C5.42699 8.51633 7.093 6.44937 9.34834 5.52554C8.58581 7.29342 8.14671 9.14341 8.03103 11.0059ZM3.1751 20.2325C3.09391 20.5912 3.41471 20.9118 3.77336 20.8305L7.73342 19.9322C9.00313 20.6171 10.4562 21.0059 12 21.0059C16.9706 21.0059 21 16.9764 21 12.0059C21 7.0353 16.9706 3.00586 12 3.00586C7.02944 3.00586 3 7.0353 3 12.0059C3 13.5485 3.38813 15.0006 4.07208 16.2696L3.1751 20.2325Z"
        fill={color}
      ></path>
    </svg>
  )
}

export default TranslationIcon
