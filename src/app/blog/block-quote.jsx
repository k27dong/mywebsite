import styled from "styled-components"

const Quote = styled.div`
  background: #eee;
  padding: 10px 10px 10px 30px;
  /* margin-bottom: 10px; */

  p {
    line-height: 25px;
    margin-bottom: 0px;
    padding-bottom: 0em;
  }
`

const BlockQuote = (props) => {
  return <Quote>{props.children}</Quote>
}

export default BlockQuote
