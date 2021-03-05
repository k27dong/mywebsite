import React, { useState, useEffect } from "react"
import { message, Card } from "antd"
import axios from "axios"
import { withRouter } from "react-router-dom"
import styled from "styled-components"
import BlogPage from "../blog/blog-page"
import { CONST } from "../util"
import copy from "clipboard-copy"

const SaltContent = (props) => {
  const key = props.match.params.key
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState({})

  useEffect(() => {
    setLoading(true)
    axios
      .post(CONST.DEPLOYMENT_HOST + "api/get_book_note", {
        key: key,
      })
      .then((res) => {
        console.log(res.data)
        setContent(res.data)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
      .then(() => {
        setLoading(false)
      })
  }, [key])

  const Wrapper = styled.div`
    font-family: "Noto Serif SC", "Noto Serif", "Source Han Serif SC",
      "Source Han Serif", serif;
  `

  const Title = styled.div`
    text-align: center;
    font-weight: bold;
    font-size: 40px;
  `

  const Author = styled.div`
    text-align: center;
    font-size: 15px;
  `

  const ChapterTitle = styled.div`
    font-weight: bold;
    font-size: 22px;
    margin-bottom: 15px;
    margin-top: 20px;
  `

  const NoteWrapper = styled(Card)`
    margin-bottom: 15px;
    background: #f7f7f7;
  `

  const Note = styled.p`
    margin: 0;
    padding: 10px;
    font-size: 16px;
  `

  const copy_note = (t) => {
    copy(t)
    message.success("Copied to clipboard!")
  }

  const single_note = (n, i) => {
    return i === 0 ? (
      <ChapterTitle>{n}</ChapterTitle>
    ) : (
      <NoteWrapper
        hoverable
        bodyStyle={{ padding: "0", color: "rgba(0, 0, 0, 0.85)" }}
        onClick={() => copy_note(n)}
      >
        <Note>{n}</Note>
      </NoteWrapper>
    )
  }

  const note_block = (note, i) => {
    return <>{note.map((n, i) => single_note(n, i))}</>
  }

  return (
    <BlogPage>
      {loading ? (
        <></>
      ) : (
        <Wrapper>
          <Title>{content.title}</Title>
          <Author>{content.author}</Author>
          {content.note.map((note, i) => note_block(note, i))}
        </Wrapper>
      )}
    </BlogPage>
  )
}

export default withRouter(SaltContent)
