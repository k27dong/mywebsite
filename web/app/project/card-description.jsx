import styled from "styled-components"
import { CONST } from "../util"

const CardDescriptionWrapper = styled.div`
  margin: 8px 0 12px 0;
  color: ${CONST.COLORS.SUBTITLE};
  line-height: 1.35;
`

const CardDescription = ({ description }) => (
  <CardDescriptionWrapper>{description}</CardDescriptionWrapper>
)

export default CardDescription
