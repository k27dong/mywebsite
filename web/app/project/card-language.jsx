import styled from "styled-components"
import language_colors from "./lang-color"

const CardLanguageWrapper = styled.div`
  margin-top: auto;
  line-height: 1.35;
`

const LanguageTag = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 12px;
  font-size: 12px;
`

const LanguageColor = styled.span`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${(props) => props.color || "#e1e4e8"};
  margin-right: 4px;
  vertical-align: middle;
`

const CardLanguage = ({ languages }) => (
  <CardLanguageWrapper>
    {languages &&
      languages.map((lang, index) => (
        <LanguageTag key={index}>
          <LanguageColor color={language_colors[lang]} />
          {lang}
        </LanguageTag>
      ))}
  </CardLanguageWrapper>
)

export default CardLanguage
