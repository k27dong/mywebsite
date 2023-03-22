import { useState, useEffect } from "react"
import { message, Card } from "antd"
import axios from "axios"
import { withRouter } from "react-router-dom"
import styled from "styled-components"
import BlogPage from "../blog/blog-page"
import { CONST } from "../util"
import copy from "clipboard-copy"

const Wrapper = styled.div`
  font-family: "Noto Serif SC", "Noto Serif", "Source Han Serif SC",
    "Source Han Serif", serif;
`

const Title = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 40px;
  margin-bottom: 1rem;
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
        setContent(res.data)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
      .then(() => {
        setLoading(false)
      })
  }, [key])

  const copy_note = (t) => {
    copy(t)
    message.success("Copied to clipboard!")
  }

  const single_note = (n, note_index, block_index) => {
    return note_index === 0 ? (
      <ChapterTitle key={`chapter_title_${block_index}_${note_index}`}>
        {n}
      </ChapterTitle>
    ) : (
      <NoteWrapper
        hoverable
        bodyStyle={{ padding: "0", color: "rgba(0, 0, 0, 0.85)" }}
        onClick={() => copy_note(n)}
        key={`note_wrapper_${block_index}_${note_index}`}
      >
        <Note key={`note_${block_index}_${note_index}`}>{n}</Note>
      </NoteWrapper>
    )
  }

  const note_block = (note, block_index) => {
    return (
      <div key={`salt_content_fragment_${block_index}`}>
        {note.map((n, i) => single_note(n, i, block_index))}
      </div>
    )
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
