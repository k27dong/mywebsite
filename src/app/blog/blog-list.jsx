import { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { message } from "antd"
import { Link } from "react-router-dom"
import { CONST, ConvertDate } from "../util"

const BlogList = () => {
  const [loading, setLoading] = useState(true)
  const [bloglist, setBloglist] = useState([])

  useEffect(() => {
    setLoading(true)
    axios
      .get(CONST.DEPLOYMENT_HOST + "api/get_blog_list")
      .then((res) => {
        // set the returned date to a datetime object
        res.data.forEach((blog) => {
          blog.date = new Date(blog.date)
        })
        setBloglist(res.data)
      })
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
  }, [])

  let curr_year = CONST.CURRENTYEAR

  const blog_block = (blog, i) => {
    const PostBlock = styled.div`
      margin-top: 0;
      display: flex;
      -webkit-align-items: center;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      margin: 13px 0;
      color : ${CONST.COLORS.TEXT};
    `

    const PostText = styled.div`
      -webkit-flex: 5;
      -ms-flex: 5;
      flex: 5;
      min-width: 0;
      margin: 0;
      background: linear-gradient(to bottom, #f4f4f4, #f6f6f6);
      text-transform: capitalize;
      line-height: 1.2;
      font-weight: bold;
    `

    const Post = styled(Link)`
      display: block;
      color: inherit;
      -webkit-text-decoration: none;
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding: 0.4em;
      height: 100%;
      width: 100%;
      font-size: large;

      &:hover {
        text-decoration: none;
        color: inherit;
      }
    `

    const Date = styled.div`
      text-align: right;
      width: 100px;
      padding-right: 30px;

      @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
        width: 68px;
        padding-right: 14px;
      }
    `

    const Year = styled.h1`
      color: ${CONST.COLORS.SUBTITLE};
    `

    let render_year_flag = false

    if (i === 0 || blog.date.getFullYear() !== curr_year) {
      render_year_flag = true
      curr_year = blog.date.getFullYear()
    }

    return (
      <div key={`blog_list_fragment_${i}`}>
        {render_year_flag && (
          <Year key={`yeartag_${i}`}>{blog.date.getFullYear()}</Year>
        )}
        <PostBlock key={`postblock_${i}`}>
          <Date key={`date_${i}`}>{ConvertDate(blog.date, "main")}</Date>
          <PostText key={`posttext_${i}`}>
            <Post key={`post_${i}`} to={"post/" + blog.abbrlink}>
              {blog.title}
            </Post>
          </PostText>
        </PostBlock>
      </div>
    )
  }

  return <>{loading ? <></> : bloglist.map((blog, i) => blog_block(blog, i))}</>
}

export default BlogList
