import React from "react"
import styled from "styled-components"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism"

const CodeBlock = (props) => {
  const Code = styled(SyntaxHighlighter)`
    font-size: 14px;
    /* font-family: Monaco, monospace; */
    line-height: 100%;
    padding: 0.2em;
    word-break: normal;
  `

  return (
    <Code
      language={props.language}
      style={tomorrow}
      showLineNumbers={!props.inline}
      wrapLines={true}
    >
      {props.value}
    </Code>
  )
}

export default CodeBlock
