import { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import BlogPage from "../blog/blog-page"
import { PostContainer, Title, PostBody } from "../blog/post"
import { CONST } from "../util"
import ProjectCard from "./project-card"

const ProjectBody = styled(PostBody)`
  margin: 2rem 0px;
`

const ProjectWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
`

const ProjectMain = () => {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    axios
      .get(CONST.DEPLOYMENT_HOST + "api/get_project_list")
      .then((res) => {
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
            return <ProjectCard key={i} project={project} />
          })}
        </ProjectWrapper>
      </PostContainer>
    </BlogPage>
  )
}

export default ProjectMain
