import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { Table, Tag, message } from "antd"
import { Link } from "react-router-dom"
import { CONST } from "../util"
import { isMobile } from "react-device-detect"

const SaltList = () => {
  const [loading, setLoading] = useState(true)
  const [saltlist, setSaltList] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    axios.get(CONST.DEPLOYMENT_HOST + "api/get_salt_list").then((res) => {
      console.log(res.data)
      setSaltList(res.data)
    })
  }, [])

  useEffect(() => {
    axios
      .get(CONST.DEPLOYMENT_HOST + "api/get_total_note_num")
      .then((res) => {
        setTotal(res.data)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
      .then(() => {
        setLoading(false)
      })
  }, [])

  const TagBlock = styled(Tag)``

  const TotalBanner = styled.div`
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding-bottom: 20px;
  `

  const tag_list = (tag, i) => {
    return i > 3 ? <></> : <TagBlock>{tag}</TagBlock>
  }

  const columns = [
    {
      title: "书名",
      dataIndex: "title",
      key: "title",
      render: (text) => <Link to={"salt/" + text}>{text}</Link>,
      width: "25%",
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      width: "20%",
    },
    {
      title: "笔记数量",
      dataIndex: "notenum",
      key: "notenum",
      width: "12%",
      sorter: (a, b) => a.notenum - b.notenum,
      align: "center",
    },
    {
      title: "豆瓣评分",
      dataIndex: "rating",
      key: "rating",
      width: "12%",
      align: "center",
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "标签",
      dataIndex: "tag",
      key: "tag",
      render: (tag) => tag.map((t, i) => tag_list(t, i)),
    },
  ]

  // remove tag column if on mobile devices
  if (isMobile) {
    columns.pop()
  }

  return (
    <>
      {loading ? (
        <></>
      ) : (
        <>
          <TotalBanner>{`${total} 个笔记`}</TotalBanner>
          <Table pagination={false} columns={columns} dataSource={saltlist} />
        </>
      )}
    </>
  )
}

export default SaltList
