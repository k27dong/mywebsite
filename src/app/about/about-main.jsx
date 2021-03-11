import React, { useState, useEffect } from "react"
import { Switch } from "antd"
import styled from "styled-components"
import BlogPage from "../blog/blog-page"
import { PostContainer, Title, Info, PostBody } from "../blog/post"

const LangSwitch = styled(Switch)`
  position: absolute;
`

const ABOUTINFO = {
  name: {
    cn: "董珂璠",
    en: "Kefan Dong",
  },
}

const AboutMain = () => {
  const [lang, setLang] = useState("en")

  const toggle_lang = (checked) => {
    setLang(checked ? "cn" : "en")
  }

  const ABOUT = {
    name: {
      cn: "董珂璠",
      en: "Kefan Dong",
    },
    birthday: "2000/04/03",
  }

  return (
    <BlogPage>
      <PostContainer>
        <LangSwitch onChange={toggle_lang} />
        <Title>{ABOUT.name[lang]}</Title>
        <Info>{ABOUT.birthday}</Info>
        <PostBody>hi</PostBody>
      </PostContainer>
    </BlogPage>
  )
}

export default AboutMain
