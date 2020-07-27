import React from "react"
import styled from "styled-components"

const Quote = styled.div`
  padding: 20px 0 10px 30px;
  background: #eee;
  margin-bottom: 10px;

  p {
    line-height: 25px;
  }
`

const BlockQuote = (props) => {
  return <Quote>{props.children}</Quote>
}

export default BlockQuote
