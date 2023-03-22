import { AboutTitle, AboutContent, SocialMedia } from "./font-book"
import { MyAge } from "../util"
import Link from "../component/link"

const EnIntro = () => {
  return (
    <>
      <AboutContent>
        I'm a 3rd year{" "}
        <Link href="https://uwaterloo.ca/future-students/programs/computer-engineering">
          Computer Engineer{" "}
        </Link>
        student at the University of Waterloo.
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
