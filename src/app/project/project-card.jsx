import styled from "styled-components";
import CardTitle from "./card-title";
import CardDescription from "./card-description";
import CardLanguage from "./card-language";

const ProjectCardWrapper = styled.div`
  box-sizing: border-box;
  display: block;
  padding: 0 8px;
  margin-bottom: 20px;
  width: 100%;

  @media only screen and (min-width: 768px) {
    width: 50%;
  }

  @media only screen and (min-width: 1200px) {
    width: 33.33333%;
  }

  @media only screen and (min-width: 1600px) {
    width: 25%;
  }
`;

const ProjectContent = styled.div`
  padding: 16px;
  height: 100%;
  border-radius: 3px;
  border-color: #eaecef;
  border: 1px solid #e1e4e8;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ProjectCard = ({ project }) => (
  <ProjectCardWrapper>
    <ProjectContent>
      <CardTitle project={project} />
      <CardDescription description={project.description} />
      <CardLanguage languages={project.language} />
    </ProjectContent>
  </ProjectCardWrapper>
);

export default ProjectCard;
