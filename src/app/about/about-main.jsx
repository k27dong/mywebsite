import React, { useState } from "react"
import { Switch } from "antd"
import styled from "styled-components"
import BlogPage from "../blog/blog-page"
import { PostContainer, Title, Info, PostBody } from "../blog/post"
import CnIntro from "./cn-intro"
import EnIntro from "./en-intro"

const LangSwitch = styled(Switch)`
  position: absolute;
`

const ABOUTINFO = {
  name: {
    cn: "董珂璠",
    en: "Kefan Dong",
  },
  birthday: "2000/04/03",
  intro: {
    cn: <CnIntro />,
    en: <EnIntro />,
  },
}

const AboutMain = () => {
  const [lang, setLang] = useState("en")

  const toggle_lang = (checked) => {
    setLang(checked ? "en" : "cn")
  }

  return (
    <BlogPage>
      <PostContainer>
        <LangSwitch
          onChange={toggle_lang}
          checkedChildren="EN"
          unCheckedChildren="ZH"
          defaultChecked
        />
        <Title>{ABOUTINFO.name[lang]}</Title>
        <Info>{ABOUTINFO.birthday}</Info>
        <PostBody>{ABOUTINFO.intro[lang]}</PostBody>
      </PostContainer>
    </BlogPage>
  )
}

export default AboutMain
