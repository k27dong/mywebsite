import styled from "styled-components"
import { withRouter } from "react-router-dom"
import {
  GithubOutlined,
  FilePdfFilled,
  LinkedinFilled,
} from "@ant-design/icons"
import { CONST } from "./util"

const Main = (props) => {
  const MainContainer = styled.div`
    margin: auto;
    height: 95vh;
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    font-family: "Georgia", "Cambria", "Times New Roman", "Times", serif;
  `

  const Name = styled.div`
    margin: 1rem 0;
    font-weight: 700;
    font-size: 1.85rem;

    &:hover {
      cursor: pointer;
      text-decoration: underline;
      text-decoration-thickness: 2px;
    }
  `

  const MainNavGroup = styled.div``

  const MainLink = styled.div`
    text-align: center;
    display: block;
    background-color: transparent;
    line-height: 1.625;
    font-size: 1.1rem;

    &:hover {
      cursor: pointer;
      text-decoration: underline;
    }
  `

  const MainLinkGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 1rem;
    flex-direction: row;
    font-size: 1.1rem;
    gap: 1rem;
  `

  return (
    <>
      <MainContainer>
        <Name onClick={() => props.history.push("/about")}>Kefan Dong</Name>
        <MainNavGroup>
          <MainLink onClick={() => props.history.push("/project")}>
            PROJECT
          </MainLink>
          <MainLink onClick={() => props.history.push("/blog")}>BLOG</MainLink>
          <MainLink onClick={() => props.history.push("/salt")}>NOTE</MainLink>
          {/* <MainLink onClick={() => props.history.push("/cv")}>CV</MainLink> */}
          <MainLink
            onClick={() => window.open(`Kevin_Dong_Resume.pdf`, "_blank")}
          >
            CV
          </MainLink>
        </MainNavGroup>

        <MainLinkGroup>
          <GithubOutlined onClick={() => window.open(CONST.GITHUB, "_blank")} />
          <LinkedinFilled
            onClick={() => window.open(CONST.LINKEDIN, "_blank")}
          />
          {/* <MailFilled /> */}
          <FilePdfFilled
            onClick={() => window.open(`Kevin_Dong_Resume.pdf`, "_blank")}
          />
        </MainLinkGroup>
      </MainContainer>
    </>
  )
}

export default withRouter(Main)
