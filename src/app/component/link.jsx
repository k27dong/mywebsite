import styled from "styled-components"
import { CONST } from "../util"

const LinkWrapper = styled.a`
  text-decoration: none;
  color: ${CONST.COLORS.LINK};
  transition: color 0.2s ease-in-out;

  &:visited {
    color: ${CONST.COLORS.LINK};
  }

  &:hover {
    color: ${CONST.COLORS.LINKHOVER};
  }
`

const Link = (props) => {
  return (
    <LinkWrapper href={props.href} target="_blank">
      {props.children}
    </LinkWrapper>
  )
}

export default Link
