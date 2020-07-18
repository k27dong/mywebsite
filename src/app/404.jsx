import React from "react"
import styled from "styled-components"
import "antd/dist/antd.css"

const NotFound = () => {
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

  return <FourOFour>404</FourOFour>
}

export default NotFound
