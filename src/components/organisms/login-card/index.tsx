import { navigate } from "gatsby"
import { useAdminLogin } from "medusa-react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import Button from "../../fundamentals/button"
import SigninInput from "../../molecules/input-signin"

type FormValues = {
  email: string
  password: string
}

type LoginCardProps = {
  toResetPassword: () => void
}

const LoginCard: React.FC<LoginCardProps> = ({ toResetPassword }) => {
  const [isInvalidLogin, setIsInvalidLogin] = useState(false)
  const { register, handleSubmit, reset } = useForm<FormValues>()
  const login = useAdminLogin()
  const { t } = useTranslation()
  const onSubmit = (values: FormValues) => {
    login.mutate(values, {
      onSuccess: () => {
        navigate("/a/orders")
      },
      onError: () => {
        setIsInvalidLogin(true)
        reset()
      },
    })
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col items-center">
        <span className="inter-2xlarge-semibold mt-4 text-grey-90">
          {t("login.welcome")}
        </span>
        <span className="inter-base-regular text-grey-50 mt-2">
          {t("login.welcome_slogan_1")}
        </span>
        <span className="inter-base-regular text-grey-50 mb-xlarge">
          {t("login.welcome_slogan_2")}
        </span>
        <SigninInput
          placeholder="Email..."
          name="email"
          ref={register({ required: true })}
          autoComplete="email"
        />
        <SigninInput
          placeholder="Password..."
          type={"password"}
          name="password"
          ref={register({ required: true })}
          autoComplete="current-password"
        />
        {isInvalidLogin && (
          <span className="text-rose-50 w-full mt-2 inter-small-regular">
            {t("login.error_text")}
          </span>
        )}
        <Button
          className="rounded-rounded mt-4 w-[320px] inter-base-regular"
          variant="primary"
          size="large"
          type="submit"
          loading={login.isLoading}
        >
          {t("login.button_login")}
        </Button>
        {/* <span
          className="inter-small-regular text-grey-50 mt-8 cursor-pointer"
          onClick={toResetPassword}
        >
          Reset password
        </span> */}
      </div>
    </form>
  )
}

export default LoginCard
