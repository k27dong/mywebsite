import { Divider } from "antd"
import styled from "styled-components"
import Coffee from "../component/coffee"
import CopyRight from "../component/copyright"
import Author from "../component/author"
import { CONST } from "../util"

const FinishLine = styled(Divider)`
  padding: 30px;
`

const FinishText = styled.div`
  -webkit-tap-highlight-color: transparent;
  font-family: "Liu Jian Mao Cao", cursive;
  font-size: 18px;
  line-height: 1.7;
    color: ${CONST.COLORS.TEXT};

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    font-size: 16px;
  }
`

const FooterInfoBlock = styled.div`
  padding-left: 30px;
  font-size: 14px;
  font-variant: tabular-nums;
    line-height: 1.5715;
    color: ${CONST.COLORS.TEXT};

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    padding: 0;
    text-align: center;
    font-size: 13px;
  }
`

const Footer = () => {
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
