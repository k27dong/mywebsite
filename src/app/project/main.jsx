import { useState, useEffect } from "react"
import axios from "axios"
import BlogPage from "../blog/blog-page"
import { CONST } from "../util"
import styled from "styled-components"
import { PostContainer, Title, PostBody } from "../blog/post"
import { BookOutlined } from "@ant-design/icons"
import language_colors from "./lang-color"

const ProjectBody = styled(PostBody)`
  margin: 2rem 0px;
`

const ProjectWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
`

const ProjectCard = styled.div`
  box-sizing: border-box;
  display: block;
  padding: 0 8px;
  margin-bottom: 20px;

  // mobile
  width: 100%;

  // medium
  @media only screen and (min-width: 768px) {
    width: 50%;
  }

  // large
  @media only screen and (min-width: 1200px) {
    width: 33.33333%;
  }

  // xlarge
  @media only screen and (min-width: 1600px) {
    width: 25%;
  }
`

const ProjectContent = styled.div`
  padding: 16px;
  height: 100%;
  border-radius: 3px;
  border-color: #eaecef;
  border: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  height: 100%;
`

const CardTitle = styled.div`
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

const CardDescription = styled.div`
  margin: 8px 0 12px 0;
  color: ${CONST.COLORS.SUBTITLE};
  line-height: 1.35;
`

const CardLanguage = styled.div`
  margin-top: auto;
  line-height: 1.35;
`

const LanguageTag = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  font-size: 12px;
`

const LanguageColor = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color || "#e1e4e8"};
  margin-right: 4px;
  vertical-align: middle;
`

const ProjectMain = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios
      .get(CONST.DEPLOYMENT_HOST + "api/get_project_list")
      .then((res) => {
        console.log(res.data)
        setProjects(res.data)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
  }, [])

  return (
    <BlogPage>
      <PostContainer>
        <Title>My Projects</Title>
        <ProjectBody>GitHub repositories that I've built.</ProjectBody>
        <ProjectWrapper>
          {projects.map((project, i) => {
            return (
              <ProjectCard key={i}>
                <ProjectContent>
                  <CardTitle>
                    <BookOutlined />
                    <UserProject
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {CONST.GITHUB_USERNAME} /{" "}
                      <ProjectName>{project.name}</ProjectName>
                    </UserProject>
                  </CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                  <CardLanguage>
                    {project.language &&
                      project.language.map((lang, index) => (
                        <LanguageTag key={index}>
                          <LanguageColor color={language_colors[lang]} />
                          {lang}
                        </LanguageTag>
                      ))}
                  </CardLanguage>
                </ProjectContent>
              </ProjectCard>
            )
          })}
        </ProjectWrapper>
      </PostContainer>
    </BlogPage>
  )
}

export default ProjectMain
