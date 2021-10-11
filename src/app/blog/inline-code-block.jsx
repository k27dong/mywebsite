import React from "react"
import styled from "styled-components"

const Code = styled.span`
  font-size: 0.85em;
  font-family: Consolas, "Bitstream Vera Sans Mono", "Courier New", Courier,
    monospace;
  line-height: 1.2em;
  word-break: normal;
  background: #f2efe6;
  padding: 0.2em 0.3em;
  border-radius: 5px;
  color: #f55151;
`

const InlineCodeBlock = (props) => {
  return <Code>{props.value}</Code>
}

export default InlineCodeBlock
