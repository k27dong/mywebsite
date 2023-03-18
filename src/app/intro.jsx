import React from "react"
import styled from "styled-components"
import { CONST } from "./util"
import Link from "./component/link"

const Container = styled.p`
  font-size: 16px;
  color: ${CONST.COLORS.TEXT};
`

const Intro = () => {
  return (
    <Container>
      <Link href={CONST.UWENG}>University of Waterloo</Link>. Previously{" "}
      <Link href={CONST.AUTODESK}>Autodesk</Link>,{" "}
      <Link href={CONST.BETTERUP}>BetterUp</Link>,{" "}
      <Link href={CONST.POINTCLICKCARE}>PointClickCare</Link>,{" "}
      <Link href={CONST.SAFYRELABS}>Safyre Labs</Link>.
    </Container>
  )
}

export default Intro
