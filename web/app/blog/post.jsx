import { useState, useEffect } from "react"
import { message } from "antd"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import { withRouter } from "react-router-dom"
import styled from "styled-components"
import BlogPage from "./blog-page"
import CodeBlock from "./code-block"
import InlineCodeBlock from "./inline-code-block"
import BlockQuote from "./block-quote"
import ImageBlock from "./image-block"
import Footer from "./footer"
import { CONST, ConvertDate } from "../util"
import Link from "../component/link"
import rehypeRaw from "rehype-raw"

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
  color: ${CONST.COLORS.TEXT};
`

const Info = styled.div`
  text-align: center;
  margin: 6px auto 20px;
`

const PostBody = styled.div`
  -webkit-tap-highlight-color: transparent;
  font-family: -apple-system, blinkmacsystemfont, "Helvetica Neue", "Segoe UI",
    roboto, arial, "PingFang TC", "Microsoft YaHei", "Source Han Sans TC",
    "Noto Sans CJK TC", "WenQuanYi Micro Hei", sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: ${CONST.COLORS.SUBTITLE};

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    font-size: 16px;
  }
`

const Post = (props) => {
  const id = props.match.params.id
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState({})

  useEffect(() => {
    setLoading(true)
    axios
      .get(CONST.DEPLOYMENT_HOST + `api/get_post/${id}`)
      .then((res) => {
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

  const lang_regex = /^language-(.*)$/

  return (
    <BlogPage>
      {loading ? (
        <></>
      ) : (
        <PostContainer>
          <Title>{content.title}</Title>
          <Info>{ConvertDate(content.date, "post")}</Info>
          <PostBody>
            <ReactMarkdown
              children={content.body}
              components={{
                a: Link,
                img: ImageBlock,
                blockquote: BlockQuote,
                code({ node, inline, className, children, ...props }) {
                  const match = !!className
                    ? className.replace(lang_regex, "$1")
                    : ""
                  return !!inline ? (
                    <InlineCodeBlock value={children} />
                  ) : (
                    <CodeBlock
                      children={String(children).replace(/\n$/, "")}
                      language={match}
                      value={children}
                    />
                  )
                },
              }}
              rehypePlugins={[rehypeRaw]}
            />
          </PostBody>
          <Footer />
        </PostContainer>
      )}
    </BlogPage>
  )
}

export default withRouter(Post)

export { PostContainer, Title, Info, PostBody }
