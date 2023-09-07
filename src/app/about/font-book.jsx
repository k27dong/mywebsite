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
import Link from "../component/link"
import { Divider } from "antd"

const AboutTitle = styled.div`
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
`

const AboutContent = styled.div`
  padding: 0 0 10px 20px;
`

const SignatureWrapper = styled.div`
  padding: 0 0 0 20px;
`

const SignatureBlock = styled.div`
  font-weight: bold;
  font-size: 15px;
  font-family: "Noto Serif SC", "Noto Serif", "Source Han Serif SC",
    "Source Han Serif", serif;
`

const raw_signature = `
  天地反复兮，火欲殂；
  大厦将崩兮，一木难扶。
  山谷有贤兮，欲投明主；
  明主求贤兮，却不知吾。
`

const generate_signature = () => {
  return raw_signature.split("\n").map((line, index) => {
    return <SignatureBlock key={index}>{line}</SignatureBlock>
  })
}

const SocialMedia = () => {
  return (
    <>
      <div>
        <MailOutlined /> | <Link href={CONST.MAIL}>me@kefan.me</Link>
      </div>
      <div>
        <GithubOutlined /> | <Link href={CONST.GITHUB}>k27dong</Link>
      </div>
      <div>
        <LinkedinOutlined /> | <Link href={CONST.LINKEDIN}>Kefan Dong</Link>
      </div>
      <div>
        <FilePdfOutlined /> | <Link href={CONST.RESUME}>Resume</Link>
      </div>
      <div>
        <ZhihuOutlined /> | <Link href={CONST.ZHIHU}>真朋克喝可乐</Link>
      </div>
      <div>
        <RestOutlined /> | <Link href={CONST.BUYMECOFFEE}>Support</Link>
      </div>
    </>
  )
}

const Signature = () => {
  return (
    <>
      <Divider plain style={{ margin: "40px 0" }} />
      <SignatureWrapper>{generate_signature()}</SignatureWrapper>
    </>
  )
}

export { AboutTitle, AboutContent, SocialMedia, Signature }
