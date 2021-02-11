import React from "react"
import styled from "styled-components"
import { Button } from "antd"
import { CONST } from "./util"
import { withRouter } from "react-router-dom"
import GithubCorner from "react-github-corner"
import Intro from "./intro"
import "antd/dist/antd.css"

const Name = styled.p`
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial,
    sans-serif;
  font-weight: bold;
  font-size: 3rem;
  line-height: 1.25;
  letter-spacing: -0.1rem;
  color: black;
  margin-bottom: 15px;
`

const Container = styled.div`
  position: absolute;
  top: 30%;
  margin-left: 5%;
`

const LinkButton = styled(Button)`
  margin-right: 10px;
  width: 80px;
`

const Main = (props) => {
  const toPage = (page) => {
    switch (page) {
      case "blog":
        props.history.push("/blog")
        break
      case "github":
        window.open(CONST.GITHUB, "_blank")
        break
      case "linkedin":
        window.open(CONST.LINKEDIN, "_blank")
        break
      default:
        console.log("error")
    }
  }

  return (
    <>
      <GithubCorner href="https://github.com/k27dong/mywebsite" />
      <Container>
        <Name>Kefan Dong</Name>
        <Intro />
        <LinkButton onClick={() => toPage("github")}>Github</LinkButton>
        <LinkButton onClick={() => toPage("linkedin")}>LinkedIn</LinkButton>
        <LinkButton onClick={() => toPage("blog")}>Blog</LinkButton>
      </Container>
    </>
  )
}

export default withRouter(Main)
