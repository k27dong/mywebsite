import React from "react"
import styled from "styled-components"
import { CONST } from "../util"

const Coffee = () => {
  const CoffeeText = styled.div``

  const CoffeeLink = styled.a`
    text-decoration: underline;
    color: #ebcd09;

    &:hover,
    &:visited,
    &:focus {
      text-decoration: underline;
    }
  `

  return (
    <CoffeeText>
      If you like what I'm doing you can{" "}
      <CoffeeLink href={CONST.BUYMECOFFEE} target="_blank">
        buy me a coffee
      </CoffeeLink>{" "}
      ☕️
    </CoffeeText>
  )
}

export default Coffee