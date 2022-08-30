import { Router } from "@reach/router"
import React from "react"
// import GiftCardDetails from "./details"
// import ManageGiftCard from "./manage"
import Overview from "./overview"

const GiftCard = () => {
  return (
    <Router>
      <Overview path="/" />
    </Router>
  )
}

export default GiftCard
