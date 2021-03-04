import React from "react"
import { Divider } from "antd"
import styled from "styled-components"
import Coffee from "../component/coffee"
import CopyRight from "../component/copyright"
import Author from "../component/author"

const Footer = () => {
  const FinishLine = styled(Divider)`
    padding: 30px;
  `

  const FinishText = styled.div`
    -webkit-tap-highlight-color: transparent;
    font-family: 'Liu Jian Mao Cao', cursive;
    font-size: 18px;
    line-height: 1.7;

    @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
      font-size: 16px;
    }
  `

  const FooterInfoBlock = styled.div`
    padding-left: 30px;

    @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
      padding: 0;
      text-align: center;
      font-size: 13px;
    }
  `

  return (
    <>
      <FinishLine plain>
        <FinishText>完</FinishText>
      </FinishLine>
      <FooterInfoBlock>
        <Author />
        <CopyRight />
        <Coffee />
      </FooterInfoBlock>
    </>
  )
}

export default Footer
