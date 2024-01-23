import { AboutTitle, AboutContent, SocialMedia, Signature } from "./font-book"
import { MyAge } from "../util"
import Link from "../component/link"

const CnIntro = () => {
  return (
    <>
      <AboutContent>
        我是滑铁卢大学
        <Link href="https://uwaterloo.ca/future-students/programs/computer-engineering">
          计算机工程
        </Link>
        的毕业生。
      </AboutContent>
      <AboutContent>我今年{MyAge()}岁，住在多伦多。</AboutContent>
      <AboutTitle>联系方式</AboutTitle>
      <SocialMedia />
      <Signature />
    </>
  )
}

export default CnIntro
