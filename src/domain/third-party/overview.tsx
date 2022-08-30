import { RouteComponentProps } from "@reach/router"
import { navigate } from "gatsby"

import React, { useMemo, useState } from "react"
import PageDescription from "../../components/atoms/page-description"
import Spinner from "../../components/atoms/spinner"
import BannerCard from "../../components/molecules/banner-card"

const Overview: React.FC<RouteComponentProps> = () => {
  const linkTo = (link: string) => {
    window.open(link)
  }
  const downloadFile = (link: string) => {
    navigate(link)
  }
  return (
    <>
      <div className="flex flex-col grow h-full">
        <PageDescription
          title="第三方应用"
          subtitle="Manage the third patry of Yunjiuding store"
        />
        <BannerCard title="支付宝">
          <BannerCard.Description
            cta={{
              label: "跳转到支付宝开发设置",
              onClick: () => linkTo("https://www.alipay.com/"),
            }}
          ></BannerCard.Description>
        </BannerCard>
        <BannerCard title="阿里云短信服务">
          <BannerCard.Description
            cta={{
              label: "跳转到阿里云短信服务设置",
              onClick: () => linkTo("https://www.aliyun.com/"),
            }}
          >
            {"账户：xcx肖才湘" + "\n" + "密码：Nonono.1"}
          </BannerCard.Description>
        </BannerCard>
        <BannerCard title="快递100">
          <BannerCard.Description
            cta={{
              label: "跳转到快递100企业设置",
              onClick: () => linkTo("https://kd100.com/"),
            }}
          >
            //默认设置为沙箱环境
          </BannerCard.Description>
        </BannerCard>
        <BannerCard title="Contentful CMS">
          <BannerCard.Description
            cta={{
              label: "跳转到CMS设置",
              onClick: () => linkTo("https://be.contentful.com/login"),
            }}
          >
            google登陆
          </BannerCard.Description>
        </BannerCard>
        <BannerCard title="我的邮箱">
          <BannerCard.Description
            cta={{
              label: "跳转到我的邮箱，查看邮件",
              onClick: () => linkTo("https://163.com"),
            }}
          >
            {"yunjiudingcommerce@163.com Nonono.1"}
          </BannerCard.Description>
        </BannerCard>
        <BannerCard title="客服服务">
          {"请选定版本下载"}
          <BannerCard.Description
            cta={{
              label: "WINDOWS 下载",
              onClick: () =>
                downloadFile(
                  "http://114.116.94.189:9090/buckets/openim/YunjiudingIM Setup 1.0.0.exe"
                ),
            }}
          ></BannerCard.Description>
          <BannerCard.Description
            cta={{
              label: "Apple ARM 下载",
              onClick: () =>
                downloadFile(
                  "http://114.116.94.189:9090/buckets/openim/YunjiudingIM-1.0.0-arm64.dmg"
                ),
            }}
          ></BannerCard.Description>
        </BannerCard>
      </div>
    </>
  )
}

export default Overview
