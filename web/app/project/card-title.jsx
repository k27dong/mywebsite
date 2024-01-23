import styled from "styled-components"
import { BookOutlined } from "@ant-design/icons"
import { CONST } from "../util"

const CardTitleWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  font-size: 18px;
`

const UserProject = styled.a`
  margin-left: 4px;
  color: ${CONST.COLORS.LINK};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: ${CONST.COLORS.LINK};
  }
`

const ProjectName = styled.span`
  font-weight: 600;
  color: ${CONST.COLORS.LINK};
`

const CardTitle = ({ project }) => (
  <CardTitleWrapper>
    <BookOutlined />
    <UserProject href={project.link} target="_blank" rel="noopener noreferrer">
      {CONST.GITHUB_USERNAME} / <ProjectName>{project.name}</ProjectName>
    </UserProject>
  </CardTitleWrapper>
)

export default CardTitle
