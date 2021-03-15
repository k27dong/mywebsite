import React from "react"
import { AboutTitle, AboutContent, SocialMedia, Contact } from "./font-book"
import { MyAge } from "../util"

const EnIntro = () => {
  return (
    <>
      <AboutContent>
        I'm a 3rd year{" "}
        <Contact href="https://uwaterloo.ca/future-students/programs/computer-engineering">
          Computer Engineer{" "}
        </Contact>
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
