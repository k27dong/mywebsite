import { useState, useEffect, useRef, useMemo } from "react"
import {
  PauseCircleOutlined,
  PlayCircleOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
} from "@ant-design/icons"
import styled, { keyframes } from "styled-components"
import axios from "axios"
import { CONST } from "../util"

// Constants for colors and sizes
const borderRadius = "5px"
const primaryColor = "#709fdc"
const baseColor = "#071739"
const shadowColor = "#274684"
const whiteColor = "#fff"
const grayColor = "#8c8c8c"
const timelineWidth = "240px"

const Card = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  max-width: 70%;
  margin: 5rem auto 0 auto;
  border-radius: ${borderRadius};
  color: ${whiteColor};
  font-weight: 100;
  box-shadow: 0px 0px 50px 0px ${shadowColor};
  background: ${baseColor};
  overflow: hidden;
`

const CurrentSong = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 20px 0px;
  border-radius: ${borderRadius};
  color: ${baseColor};
  background: ${whiteColor};

  audio {
    display: none;
  }
`

const TrackImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
`

const TrackDescr = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

const TrackName = styled.span`
  font-size: 16px;
`

const TrackAuthor = styled.span`
  font-size: 14px;
  color: grey;
`

const TrackDuration = styled.span`
  font-size: 14px;
`

const ImgWrap = styled.div`
  position: relative;
  margin: 0 auto;
  width: 270px;
  height: 200px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0px 10px 40px 0px rgba(${shadowColor}, 0.7);

  img {
    width: auto;
    height: 100%;
  }
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`

const SongName = styled.span`
  margin-top: 30px;
  font-size: 22px;
`

const SongAuthor = styled.span`
  color: ${primaryColor};
`

const Time = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  width: ${timelineWidth};
`

const Timeline = styled.div`
  position: relative;
  margin: 0 auto;
  width: ${timelineWidth};
  height: 5px;
  background: ${primaryColor};
  border-radius: 5px;
  cursor: pointer;
`

const Playhead = styled.div`
  position: relative;
  z-index: 2;
  width: 0;
  height: 5px;
  border-radius: 5px;
  background: ${baseColor};
`

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const HoverPlayhead = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  width: 0;
  height: 5px;
  opacity: 0;
  border-radius: 5px;
  background: ${shadowColor};
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;

    &::before,
    &::after {
      opacity: 1;
    }
  }

  &::before {
    content: attr(data-content);
    display: block;
    position: absolute;
    top: -30px;
    right: -23px;
    width: 40px;
    padding: 3px;
    text-align: center;
    color: ${whiteColor};
    background: ${shadowColor};
    border-radius: calc(${borderRadius} - 12px);
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: -8px;
    right: -8px;
    border-top: 8px solid ${shadowColor};
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
  }
`

const ControlButton = styled.button`
  color: ${baseColor};
  border-radius: 50%;
  margin: 15px;
  font-size: 18px;
  text-align: center;
  transition: 0.2s;
  cursor: pointer;
  border: none;
  background: none;

  &:focus {
    outline: none;
  }

  &.play {
    width: 50px;
    height: 50px;
    border: 1px solid #e2e2e2;

    &:hover {
      box-shadow: 0px 0px 15px 0px rgba(${shadowColor}, 0.7);
    }

    .fa-play {
      transform: translateX(2px);
    }
  }

  &.prev-next {
    width: 35px;
    height: 35px;

    &:hover {
      transform: scale(1.2);
    }
  }
`

const PlayList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 100%;
  padding-top: 3rem;
`

const Track = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  border-radius: calc(${borderRadius} - 10px);
  border: 1px solid transparent;
  transition: 0.3s;
  cursor: pointer;

  &:hover {
    background: ${shadowColor};
    border-color: ${shadowColor};
    position: relative;
  }

  &.current-audio {
    background: ${shadowColor};
    box-shadow: 0px 0px 15px 0px ${shadowColor};
  }

  &.play-now {
    background: ${shadowColor};
    box-shadow: 0px 0px 15px 0px ${shadowColor};
    position: relative;
    /* animation: ${rotate} 2s linear infinite; */
  }

  .track-img {
    width: 90px;
    border-radius: calc(${borderRadius} - 10px);
  }

  .track-discr {
    margin-left: 15px;
    display: flex;
    flex-direction: column;
    min-width: 190px;
  }

  .track-name {
    font-size: 17px;
    margin-top: 8px;
  }

  .track-author {
    margin-top: 8px;
    font-weight: 300;
    color: ${primaryColor};
  }

  .track-duration {
    min-width: 40px;
    margin-left: 10px;
    margin-right: 10px;
    font-weight: 500;
  }
`

const MusicPlayer = ({ id }) => {
  const [index, setIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState("0:00")
  const [musicList, setMusicList] = useState([
    {
      name: "Nice piano and ukulele",
      author: "Royalty",
      img: "https://www.bensound.com/bensound-img/buddy.jpg",
      audio: "https://www.bensound.com/bensound-music/bensound-buddy.mp3",
      duration: "2:02",
    },
  ])
  const [pause, setPause] = useState(false)
  const currentSong = useMemo(() => musicList[index], [musicList, index])
  const playerRef = useRef(null)
  const timelineRef = useRef(null)
  const playheadRef = useRef(null)
  const hoverPlayheadRef = useRef(null)

  useEffect(() => {
    axios
      .post(CONST.DEPLOYMENT_HOST + "api/get_playlist_data", {
        id: id,
      })
      .then((res) => {
        setMusicList(
          res.data.map((item) => {
            return {
              ...item,
              audio: `/images/${id}/${item.audio}.${item.format}`,
              cover: `/images/${id}/${item.cover}.jpg`,
            }
          }),
        )
        updatePlayer()
        console.log(musicList)
      })
      .catch((err) => {
        console.error("Error ", err)
      })
  }, [])

  useEffect(() => {
    const player = playerRef.current
    const timeline = timelineRef.current

    const timeUpdate = () => {
      const duration = player.duration
      // const timelineWidth =
      //   timeline.offsetWidth - playheadRef.current.offsetWidth
      const playPercent = 100 * (player.currentTime / duration)
      playheadRef.current.style.width = playPercent + "%"
      const currentTimeFormatted = formatTime(parseInt(player.currentTime))
      setCurrentTime(currentTimeFormatted)
    }

    const nextSong = () => {
      setIndex((prevIndex) => (prevIndex + 1) % musicList.length)
      updatePlayer()
      if (pause) {
        player.play()
      }
    }

    const changeCurrentTime = (e) => {
      const duration = player.duration
      const playheadWidth = timeline.offsetWidth
      const offsetWidth = timeline.offsetLeft
      const userClickWidth = e.clientX - offsetWidth
      const userClickWidthInPercent = (userClickWidth * 100) / playheadWidth
      playheadRef.current.style.width = userClickWidthInPercent + "%"
      player.currentTime = (duration * userClickWidthInPercent) / 100
    }

    const hoverTimeLine = (e) => {
      const duration = player.duration
      const playheadWidth = timeline.offsetWidth
      const offsetWidth = timeline.offsetLeft
      const userClickWidth = e.clientX - offsetWidth
      const userClickWidthInPercent = (userClickWidth * 100) / playheadWidth
      if (userClickWidthInPercent <= 100) {
        hoverPlayheadRef.current.style.width = userClickWidthInPercent + "%"
      }
      const time = (duration * userClickWidthInPercent) / 100
      if (time >= 0 && time <= duration) {
        hoverPlayheadRef.current.dataset.content = formatTime(time)
      }
    }

    const resetTimeLine = () => {
      hoverPlayheadRef.current.style.width = 0
    }

    player.addEventListener("timeupdate", timeUpdate)
    player.addEventListener("ended", nextSong)
    timeline.addEventListener("click", changeCurrentTime)
    timeline.addEventListener("mousemove", hoverTimeLine)
    timeline.addEventListener("mouseout", resetTimeLine)

    return () => {
      player.removeEventListener("timeupdate", timeUpdate)
      player.removeEventListener("ended", nextSong)
      timeline.removeEventListener("click", changeCurrentTime)
      timeline.removeEventListener("mousemove", hoverTimeLine)
      timeline.removeEventListener("mouseout", resetTimeLine)
    }
  }, [musicList, pause, index, currentSong])

  const playOrPause = () => {
    if (!pause) {
      playerRef.current.play()
    } else {
      playerRef.current.pause()
    }
    setPause(!pause)
  }

  const clickAudio = (key) => {
    setIndex(key)
    updatePlayer()
    if (pause) {
      playerRef.current.play()
    }
  }

  const prevSong = () => {
    setIndex(
      (prevIndex) => (prevIndex + musicList.length - 1) % musicList.length,
    )
    updatePlayer()
    if (pause) {
      playerRef.current.play()
    }
  }

  const nextSong = () => {
    setIndex((prevIndex) => (prevIndex + 1) % musicList.length)
    updatePlayer()
    if (pause) {
      playerRef.current.play()
    }
  }

  const updatePlayer = () => {
    const currentSong = musicList[index]
    playerRef.current.src = currentSong.audio
    playerRef.current.load()
  }

  const formatTime = (currentTime) => {
    const minutes = Math.floor(currentTime / 60)
    let seconds = Math.floor(currentTime % 60)

    seconds = seconds >= 10 ? seconds : "0" + (seconds % 60)

    const formattedTime = minutes + ":" + seconds
    return formattedTime
  }

  return (
    <Card>
      <PlayList>
        {musicList.map((music, key) => (
          <Track
            key={key}
            onClick={() => clickAudio(key)}
            className={
              (index === key && !pause ? "current-audio" : "") +
              (index === key && pause ? "play-now" : "")
            }
          >
            <TrackImg src={music.cover} alt={music.title} />
            <TrackDescr>
              <TrackName>{music.title}</TrackName>
              <TrackAuthor>{music.artist}</TrackAuthor>
            </TrackDescr>
            <TrackDuration>
              {index === key ? currentTime : music.duration}
            </TrackDuration>
          </Track>
        ))}
      </PlayList>

      <CurrentSong>
        <audio ref={playerRef}>
          <source src={currentSong.audio} type="audio/ogg" />
          Your browser does not support the audio element.
        </audio>
        <ImgWrap>
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            style={{ width: "100%", height: "100%" }}
          />
        </ImgWrap>
        <SongName>{currentSong.title}</SongName>
        <SongAuthor>{currentSong.artist}</SongAuthor>

        <Time>
          <div>{currentTime}</div>
          <div>{currentSong.duration}</div>
        </Time>

        <Timeline ref={timelineRef}>
          <Playhead ref={playheadRef}></Playhead>
          <HoverPlayhead ref={hoverPlayheadRef}></HoverPlayhead>
        </Timeline>

        <Controls>
          <ControlButton onClick={prevSong} className="prev-next">
            <StepBackwardOutlined />
          </ControlButton>
          <ControlButton onClick={playOrPause} className="play">
            {!pause ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
          </ControlButton>
          <ControlButton onClick={nextSong} className="prev-next">
            <StepForwardOutlined />
          </ControlButton>
        </Controls>
      </CurrentSong>
    </Card>
  )
}

export default MusicPlayer
