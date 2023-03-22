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

const AboutTitle = styled.div`
  padding: 20px;
  font-size: 20px;
  font-weight: bold;
`

const AboutContent = styled.div`
  padding: 0 0 10px 20px;
`

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

export { AboutTitle, AboutContent, SocialMedia }
