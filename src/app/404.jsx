import styled from "styled-components"

const FourOFour = styled.p`
  position: absolute;
  top: 30%;
  margin-left: 5%;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
  font-weight: bold;
  font-size: 3rem;
  line-height: 1.25;
  letter-spacing: 0.1rem;
  color: black;
  margin-bottom: 15px;
`

const FourOFourText = styled.div`
  position: absolute;
  top: 38%;
  margin-left: 5%;
`

const NotFound = () => {
  return (
    <>
      <FourOFour>404</FourOFour>
      <FourOFourText>生活总归带点荒谬🤔</FourOFourText>
    </>
  )
}

export default NotFound
