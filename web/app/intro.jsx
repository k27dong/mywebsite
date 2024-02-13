import styled from "styled-components"
import { CONST } from "./util"
import Link from "./component/link"
import { isMobile } from "react-device-detect"

const Container = styled.p`
  font-size: 16px;
  color: ${CONST.COLORS.TEXT};
`

const Intro = () => {
  return (
    <Container>
      Software Engineer at <Link href={CONST.AUTODESK}>Autodesk</Link>.{" "}
      {isMobile && (
        <>
          <br />
          <br />
        </>
      )}
      University of Waterloo <Link href={CONST.UWCE}>Computer Engineering</Link>{" "}
      alumnus, Class of 2023.
    </Container>
  )
}

export default Intro
