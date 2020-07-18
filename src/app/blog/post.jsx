import React, { useState, useEffect } from "react"
import { message } from "antd"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { withRouter } from "react-router-dom"
import styled from "styled-components"
import BlogPage from "./blog-page"
import { CONST, ConvertDate } from "../util"


const Post = (props) => {
  const id = props.match.params.id
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState({})

  useEffect(() => {
    setLoading(true)
    axios
      .post(CONST.HOST + "api/get_post", {
        id: id,
      })
      .then((res) => {
        console.log(res.data)
        res.data.date = new Date(res.data.date)
        setContent(res.data)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
      .then(() => {
        setLoading(false)
      })
  }, [id])

  const PostContainer = styled.div`
    font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial,
      "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
  `

  const Title = styled.div`
    line-height: 1.25;
    font-size: 26px;
    font-weight: bold;
    text-align: center;
    display: block;
  `

  const Info = styled.div`
    text-align: center;
    margin: 6px auto 20px;
  `

  const PostBody = styled.div`
    -webkit-tap-highlight-color: transparent;
    font-family: "PingFang SC", "Helvetica Neue", Helvetica, Arial,
      "Hiragino Sans GB", "Microsoft Yahei", "WenQuanYi Micro Hei", sans-serif;
    font-size: 18px;
    line-height: 1.7;
  `

  return (
    <BlogPage>
      {loading ? (
        <></>
      ) : (
        <PostContainer>
          <Title>{content.title}</Title>
          <Info>{ConvertDate(content.date, "post")}</Info>
          <PostBody>
            <ReactMarkdown source={content.body} escapeHtml={false} />
          </PostBody>
        </PostContainer>
      )}
    </BlogPage>
  )
}

export default withRouter(Post)
