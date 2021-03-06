import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { Table, Tag, message } from "antd"
import { Link } from "react-router-dom"
import { CONST } from "../util"
import { isMobile } from "react-device-detect"

const TagBlock = styled(Tag)``

const TotalBanner = styled.div`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  padding-bottom: 20px;
`

const SaltList = () => {
  const [loading, setLoading] = useState(true)
  const [saltlist, setSaltList] = useState([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    axios.get(CONST.DEPLOYMENT_HOST + "api/get_salt_list").then((res) => {
      // setSaltList(res.data)
      setSaltList(
        res.data.map((note, i) => {
          return {
            ...note,
            key: i,
          }
        })
      )
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

  const tag_list = (tag, i, row_index) => {
    return (
      <>
        {i <= 3 && (
          <TagBlock key={`tag_block_${row_index.key}_${i}`}>{tag}</TagBlock>
        )}
      </>
    )
  }

  const columns = [
    {
      title: "书名",
      dataIndex: "title",
      key: "title",
      width: "25%",
      render: (text) => <Link to={"salt/" + text}>{text}</Link>,
      onCell: (record, row_index) => ({
        key: `title_${row_index}`,
      }),
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
      width: "20%",
      onCell: (record, row_index) => ({
        key: `author_${row_index}`,
      }),
    },
    {
      title: "笔记数量",
      dataIndex: "notenum",
      key: "notenum",
      width: "12%",
      align: "center",
      sorter: (a, b) => a.notenum - b.notenum,
      onCell: (record, row_index) => ({
        key: `notenum_${row_index}`,
      }),
    },
    {
      title: "豆瓣评分",
      dataIndex: "rating",
      key: "rating",
      width: "12%",
      align: "center",
      sorter: (a, b) => a.rating - b.rating,
      onCell: (record, row_index) => ({
        key: `rating_${row_index}`,
      }),
    },
    {
      title: "标签",
      dataIndex: "tag",
      key: "tag",
      render: (tag, row_index) => tag.map((t, i) => tag_list(t, i, row_index)),
      onCell: (record, row_index) => ({
        key: `tag_${row_index}`,
      }),
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
