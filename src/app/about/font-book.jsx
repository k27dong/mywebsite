import React from "react"
import styled from "styled-components"
import {
  ZhihuOutlined,
  MailOutlined,
  GithubOutlined,
  LinkedinOutlined,
  FilePdfOutlined,
  RestOutlined,
} from "@ant-design/icons"
import { CONST } from "../util"

const AboutTitle = styled.div`
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
`

const AboutContent = styled.div`
  padding: 0 0 10px 20px;
`

const Contact = styled(`a`).attrs((props) => ({
  target: "_blank",
  rel: "noopener noreferrer",
}))``

const SocialMedia = () => {
  return (
    <>
      <div>
        <MailOutlined /> | <Contact href={CONST.MAIL}>me@kefan.me</Contact>
      </div>
      <div>
        <GithubOutlined /> | <Contact href={CONST.GITHUB}>k27dong</Contact>
      </div>
      <div>
        <LinkedinOutlined /> |{" "}
        <Contact href={CONST.LINKEDIN}>Kefan Dong</Contact>
      </div>
      <div>
        <FilePdfOutlined /> | <Contact href={CONST.RESUME}>Resume</Contact>
      </div>
      <div>
        <ZhihuOutlined /> | <Contact href={CONST.ZHIHU}>真朋克喝可乐</Contact>
      </div>
      <div>
        <RestOutlined /> | <Contact href={CONST.BUYMECOFFEE}>Support</Contact>
      </div>
    </>
  )
}

export { AboutTitle, AboutContent, SocialMedia, Contact }
