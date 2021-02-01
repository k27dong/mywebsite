import React from "react"
import styled from "styled-components"
import { CONST } from "./util"

const Container = styled.p`
  font-size: 16px;
`

const IntroLink = (props) => {
  return (
    <a href={props.url} target="_blank" rel="noopener noreferrer">
      {props.text}
    </a>
  )
}

const Intro = () => {
  return (
    <Container>
      <IntroLink url={CONST.UWENG} text={"University of Waterloo"} />,
      Previously{" "}
      <IntroLink url={CONST.CIBC} text={"CIBC"} />,{" "}
      <IntroLink url={CONST.POINTCLICKCARE} text={"PointClickCare"} />,{" "}
      <IntroLink url={CONST.SAFYRELABS} text={"Safyre Labs"} />
    </Container>
  )
}

export default Intro
