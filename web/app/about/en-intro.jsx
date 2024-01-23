import { AboutTitle, AboutContent, SocialMedia } from "./font-book"
import { MyAge } from "../util"
import Link from "../component/link"

const EnIntro = () => {
  return (
    <>
      <AboutContent>
        I'm a graduate of the University of Waterloo in{" "}
        <Link href="https://uwaterloo.ca/future-students/programs/computer-engineering">
          Computer Engineering
        </Link>
        .
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
