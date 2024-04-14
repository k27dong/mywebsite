import { AboutTitle, AboutContent, SocialMedia } from "./font-book"
import { MyAge } from "../util"
import Link from "../component/link"

const EnIntro = () => {
  return (
    <>
      <AboutContent>
      Software Engineer at <Link href={CONST.AUTODESK}>Autodesk</Link>.
      </AboutContent>
      <AboutContent>
        I'm {MyAge()} years old, currently living in Toronto, Canada.
      </AboutContent>

      <AboutTitle>Contact Me</AboutTitle>
      <SocialMedia />
    </>
  )
}

export default EnIntro
