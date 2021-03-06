import React from "react"
import styled from "styled-components"
import { CONST } from "../util"

const CopyRightText = styled.div``

const CopyRight = () => {
  return <CopyRightText>Copyright © {CONST.CURRENTYEAR}</CopyRightText>
}

export default CopyRight
