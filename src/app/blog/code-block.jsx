import styled from "styled-components"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism"

const Code = styled(SyntaxHighlighter)`
  background-color: #f7f4eb !important;
`

const CodeBlock = (props) => {
  console.log(props)

  return (
    <Code
      language={props.language}
      style={ghcolors}
      showLineNumbers={!!props.language}
      wrapLines={true}
      codeTagProps={{
        style: {
          fontFamily: "Fira Code, monospace",
        },
      }}
    >
      {props.value[0].slice(0, -1)}
    </Code>
  )
}

export default CodeBlock
