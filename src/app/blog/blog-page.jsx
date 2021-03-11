import React from "react"
import styled from "styled-components"
import { Link } from "react-router-dom"

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
  padding-right: 25px;

  &:hover {
    text-decoration: none;
    color: inherit;
  }
`

const SmallLink = styled(TitleText)`
  font-size: 18px;
`

const Background = styled.div`
  width: 75%;
  margin: 7% auto;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    width: 100%;
  }
`

const Container = styled.div`
  background: white;
  box-shadow: 0 1px 6px #e5e5e5;
`

const Wrapper = styled.div`
  padding: 50px;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    padding: 50px 15px;
  }
`

const BlogPage = ({ children }) => {
  document.body.style = "background: #fafafa;"

  return (
    <Background>
      <TitleBlock>
        <TitleText to="">Home</TitleText>
        <SmallLink to="/salt">Notes</SmallLink>
        <SmallLink to="/blog">Blog</SmallLink>
        {/* <SmallLink to="/about">About</SmallLink> */}
      </TitleBlock>
      <Container>
        <Wrapper>{children}</Wrapper>
      </Container>
    </Background>
  )
}

export default BlogPage
