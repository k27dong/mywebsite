import styled from "styled-components"

const Image = styled.img`
    max-height: 45rem;
    max-width: 100%;
`

const ImageWrapper = styled.div`
    text-align: center;
`

const ImageBlock = (props) => {
  return (
    <ImageWrapper>
        <Image {...props} />
    </ImageWrapper>
  )
}

export default ImageBlock
