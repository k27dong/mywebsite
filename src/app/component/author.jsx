import React from "react"
import styled from "styled-components"
import { CONST } from "../util"

const AuthorText = styled.div``

const Author = () => {
  return <AuthorText>Author: {CONST.WHOAMI}</AuthorText>
}

export default Author
