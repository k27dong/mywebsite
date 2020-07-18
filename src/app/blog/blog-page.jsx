import React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"

const BlogPage = ({children}) => {
  document.body.style = "background: #fafafa;"

  const TitleBlock = styled.div`
    display: block;
    margin-bottom: 20px;
    margin-left: 20px;
  `

  const TitleText = styled(Link)`
    color: inherit;
    text-decoration: none;
    font-size: 25px;
    font-weight: bold;
    line-height: 1.25;

    &:hover {
      text-decoration: none;
      color: inherit;
    }
  `

  const Background = styled.div`
    width: 75%;
    margin: 7% auto;
  `

  const Container = styled.div`
    background: white;
    box-shadow: 0 1px 6px #e5e5e5;
  `

  const Wrapper = styled.div`
    padding: 50px;
  `

  return (
    <Background>
      <TitleBlock>
        <TitleText to="/blog">Blog</TitleText>
      </TitleBlock>
      <Container>
        <Wrapper>
          {children}
        </Wrapper>
      </Container>
    </Background>
  )
}

export default BlogPage
