import { AboutTitle, AboutContent, SocialMedia } from "./font-book"
import { MyAge, CONST } from "../util"
import Link from "../component/link"

const EnIntro = () => {
  return (
    <>
      <AboutContent>
        Software Engineer at <Link href={CONST.AUTODESK}>Autodesk</Link>.
      </AboutContent>

      <AboutContent>
        University of Waterloo{" "}
        <Link href={CONST.UWCE}>Computer Engineering</Link> alumnus, Class of
        2023.
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
