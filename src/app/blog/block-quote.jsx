import styled from "styled-components"

const Quote = styled.div`
  padding: 20px 10px 10px 30px;
  background: #eee;
  /* margin-bottom: 10px; */

  p {
    line-height: 25px;
    margin-bottom: 0px;
  }
`

const BlockQuote = (props) => {
    console.log(props.children[1])
  return <Quote>{props.children[1]}</Quote>
}

export default BlockQuote
