import React, { useState, useEffect } from "react"
import axios from "axios"
import styled from "styled-components"
import { message } from "antd"
import { Link } from "react-router-dom"
import { CONST } from "../util"
import { Table } from "antd"

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

  const columns = [
    {
      title: "书名",
      dataIndex: "title",
      key: "title",
      render: (text) => <Link to={"salt/" + text}>{text}</Link>,
    },
    {
      title: "作者",
      dataIndex: "author",
      key: "author",
    },
    {
      title: "笔记数量",
      dataIndex: "notenum",
      key: "notenum",
    },
  ]

  const TotalBanner = styled.div`
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding-bottom: 20px;
  `

  return (
    <>
      {loading ? (
        <></>
      ) : (
        <>
        <TotalBanner>
          {`${total} 个笔记`}
        </TotalBanner>
        <Table pagination={false} columns={columns} dataSource={saltlist} />
        </>
      )}
    </>
  )
}

export default SaltList
