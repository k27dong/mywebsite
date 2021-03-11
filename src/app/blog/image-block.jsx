import React from "react"
import styled from "styled-components"

const Image = styled.img`
  max-width: 100%;
  opacity: 0.2;
`

const ImageBlock = (props) => {
  return <Image {...props} />
}

export default ImageBlock
