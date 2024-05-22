import styled from "styled-components"

const Quote = styled.div`
  background: #f9f9f9;
  border-left: 5px solid #ccc;
  padding: 15px 20px;
  margin: 20px 0;

  p {
    line-height: 1.6;
    margin: 0;
  }
`

const BlockQuote = (props) => {
  return <Quote>{props.children}</Quote>
}

export default BlockQuote
