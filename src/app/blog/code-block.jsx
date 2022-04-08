import React from "react"
import styled from "styled-components"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism"

const Code = styled(SyntaxHighlighter)`
  font-size: 16px;
  /* font-family: Monaco, monospace; */
  line-height: 100%;
  padding: 0.2em;
  word-break: normal;
  background-color: #f7f4eb !important;
`

const CodeBlock = (props) => {
  return (
    <Code
      language={props.language}
      style={ghcolors}
      // showLineNumbers={!props.inline}
      showLineNumbers={false}
      wrapLines={true}
    >
      {props.value}
    </Code>
  )
}

export default CodeBlock
