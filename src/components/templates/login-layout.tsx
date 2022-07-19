import React from "react"
import { withTrans } from "../../i18n/withTrans"

const LoginLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="grid grid-cols-1 grid-rows-1 min-h-screen">
        <div
          className="flex flex-col items-center"
          style={{
            background: "linear-gradient(73.29deg, #7C53FF 0%, #F796FF 100%)",
          }}
        >
          {children}
          <div className="text-grey-0 inter-base-regular pb-12">
            © 云九鼎YunJiuDing <span>&#183;</span>{" "}
            <a
              style={{ color: "inherit", textDecoration: "none" }}
              href="https://yunjiuding.com/contact"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withTrans(LoginLayout)
