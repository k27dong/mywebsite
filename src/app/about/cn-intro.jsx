import React from "react"
import { AboutTitle, AboutContent, SocialMedia, Contact } from "./font-book"
import { MyAge } from "../util"

const CnIntro = () => {
  return (
    <>
      <AboutContent>
        我是一名滑铁卢大学的大三学生，学习
        <Contact href="https://uwaterloo.ca/future-students/programs/computer-engineering">
          计算机工程。
        </Contact>
      </AboutContent>
      <AboutContent>我今年{MyAge()}岁，住在多伦多。</AboutContent>
      <AboutTitle>联系方式</AboutTitle>
      <SocialMedia />
    </>
  )
}

export default CnIntro
