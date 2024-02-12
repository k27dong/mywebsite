import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import axios from "axios"
import { LyricPlayer, BackgroundRender } from "@applemusic-like-lyrics/react"
import { CONST } from "../util"
import { isMobile } from "react-device-detect"
import { Progress, Spin } from "antd"
import {
  ForwardOutlined,
  BackwardOutlined,
  PauseOutlined,
  CaretRightOutlined,
} from "@ant-design/icons"

const MUSIC_PLAYER_HEIGHT = "33em"
const LRYIC_CONTROl_RADIO = 0.75 // 75%: lyric, 25%: control
const MOBILE_PLAYLIST_HEIGHT = "24em"
const MOBILE_LYRIC_CONTROL_RATIO = 0.7

const MusicPlayerContainer = styled.div`
  display: flex;
  width: 100%;
  margin: 2em auto;

  /* Border & shadow */
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 40px -10px rgba(0, 0, 0, 0.3),
    0 0 25px -15px rgba(0, 0, 0, 0.2);

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    flex-direction: column;
    width: 90%;
  }
`

const PlaylistContainer = styled.div`
  width: 45%;
  overflow-y: scroll;
  max-height: ${MUSIC_PLAYER_HEIGHT};
  scrollbar-width: none;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    width: 100%;
    max-height: ${MOBILE_PLAYLIST_HEIGHT};
    border-radius: 0 0 10px 10px;
  }
`

const PlayerControlContainer = styled.div`
  width: 55%;
  display: flex;
  flex-direction: column;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    width: 100%;
  }
`

const PlaylistItemContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 0.2rem;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`
const PlaylistItem = styled.div`
  display: flex;
  justify-content: flex-start;
`

const PlaylistItemAlbum = styled.div`
  padding: 0.4rem 0.4rem;
  align-self: center;
`

const PlaylistItemInfo = styled.div`
  padding: 0.4rem 0.4rem;
  align-self: center;
`

const PlaylistAlbum = styled.img`
  display: inline-block;
  background-position: center;
  border-radius: 6px;
  background-size: cover;
  border: none;
  width: 3rem;
  height: 3rem;
  /* cursor: pointer; */
  position: relative;
  transition: transform ease-in 0.1s, box-shadow ease-in 0.25s;
  box-shadow: 0 2px 10px rgba(20, 0, 208, 0.29);
`

const PlaylistSongTitle = styled.div`
  font-size: 18px;
`

const PlaylistSongArtist = styled.div`
  font-size: 12px;
`

const PlaylistSummary = styled.div`
  padding: 1rem 0 0.5rem 1rem;
  font-size: 15px;
  color: ${CONST.COLORS.TEXT};
`

const PlaylistIndex = styled.div`
  place-self: center;
  margin: 0 0.3rem;
  font-weight: bold;
  font-size: 16px;
`

const PlayerLyricContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  height: ${MUSIC_PLAYER_HEIGHT};
`

const PlayerBackground = styled(BackgroundRender)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  border-radius: 0 6px 6px 0;
  overflow: hidden;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    border-radius: 10px 10px 0 0;
  }
`

const PlayerLyric = styled(LyricPlayer)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  height: ${LRYIC_CONTROl_RADIO * 100}%;
  line-height: 1.15;
  font-weight: 500;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    height: ${MOBILE_LYRIC_CONTROL_RATIO * 100}%;
  }
`

const PlayerButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 60%;
  margin: auto;
  margin-top: -4px;
`

const PlayerControlGroups = styled.div`
  z-index: 1;
  color: white;
  position: absolute;
  top: ${LRYIC_CONTROl_RADIO * 100}%;
  height: ${(1 - LRYIC_CONTROl_RADIO) * 100}%;
  padding-left: 5%;
  width: 100%;
  padding-right: 5%;
  line-height: 1;
  display: flex;
  flex-direction: column;

  @media only screen and (max-device-width: 480px) and (-webkit-min-device-pixel-ratio: 2) {
    top: ${MOBILE_LYRIC_CONTROL_RATIO * 100}%;
    height: ${(1 - MOBILE_LYRIC_CONTROL_RATIO) * 100}%;
  }
`

const PlayerTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin: 1em 0 0.2em 0;
`

const PlayerArtist = styled.div`
  font-size: 14px;
`

const PlayerProgressBar = styled.div`
  /* padding: 0.5em 0; */
  margin-top: 4px;
  opacity: 0.9;
`

const PlayerRemainingTime = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: -4px;
`

const RemainingTime = styled.div`
  font-size: 14px;
`

const LoadingContainer = styled.div`
  height: ${MUSIC_PLAYER_HEIGHT};
  color: #fff;
  display: flex;
  justify-content: center;
  margin: auto;
`

const PlayerControlButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 3em;
  height: 3em;
  border: none;
  background-color: transparent;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }

  span {
    font-size: 2.5em;
  }
`

const MusicPlayer = ({ id }) => {
  const [loading, setLoading] = useState(true)
  const [songs, setSongs] = useState([])

  useEffect(() => {
    setLoading(true)
    axios
      .get(CONST.DEPLOYMENT_HOST + `api/get_playlist/${id}`)
      .then((res) => {
        setSongs(res.data)
      })
      .then(() => {
        setLoading(false)
      })
      .catch((err) => {
        message.error("Error ", err)
      })
  }, [])

  const calculate_playlist_duration = (songs) => {
    const total_duration_seconds = songs.reduce(
      (sum, song) => sum + parseInt(song.duration, 10),
      0
    )

    const hours = Math.floor(total_duration_seconds / 3600)
    const minutes = Math.floor((total_duration_seconds % 3600) / 60)

    const hour_text = hours === 1 ? "hour" : "hours"
    const minute_text = minutes === 1 ? "minute" : "minutes"
    const song_text = songs.length === 1 ? "song" : "songs"

    let message = `${songs.length} ${song_text}, `

    if (hours > 0) {
      message += `${hours} ${hour_text}`
    }

    if (minutes > 0) {
      if (hours > 0) {
        message += ` and `
      }
      message += `${minutes} ${minute_text}`
    }

    if (hours === 0 && minutes === 0) {
      message = "Empty playlist. Add some songs!"
    }

    return message
  }

  const parse_lrc_to_ttml = (lrc, duration) => {
    const lrc_pattern = /\[(\d{2}):(\d{2})\.?(\d{1,3})?\]\s*(.*)/
    const lines = lrc.split("\n")
    const total_duration = duration * 1000 // duration is in s, convert to ms
    let result = []

    const parse_to_ms = (m, s, ms) => {
      return m * 60 * 1000 + s * 1000 + ms
    }

    let intro = {
      words: [
        {
          startTime: 0,
          endTime: 0,
          word: "",
        },
      ],
      translatedLyric: "",
      romanLyric: "",
      startTime: 0,
      endTime: 0,
      isBG: true,
      isDuet: false,
    }

    let outro = {
      words: [
        {
          startTime: 0,
          endTime: total_duration,
          word: "",
        },
      ],
      translatedLyric: "",
      romanLyric: "",
      startTime: 0,
      endTime: total_duration,
      isBG: true,
      isDuet: false,
    }

    let prev_line = null

    for (let line of lines) {
      line = line.trim().replace(/\u00a0/g, " ")
      const match = lrc_pattern.exec(line)

      if (!match) continue

      let m = parseInt(match[1], 10)
      let s = parseInt(match[2], 10)
      let ms = parseInt(match[3], 10) || 0
      let word = match[4]

      let curr_start = parse_to_ms(m, s, ms)

      // handle intro
      if (result.length === 0 && curr_start > 0 && prev_line === null) {
        intro.endTime = curr_start - 1
        intro.words[0].endTime = intro.endTime
        result.push(intro)
      }

      // handle previous line
      if (prev_line) {
        prev_line.endTime = curr_start - 1
        prev_line.words[0].endTime = prev_line.endTime
        result.push(prev_line)
      }

      // record current line
      prev_line = {
        words: [
          {
            startTime: curr_start,
            endTime: 0,
            word: word,
          },
        ],
        translatedLyric: "",
        romanLyric: "",
        startTime: curr_start,
        endTime: 0,
        isBG: false,
        isDuet: false,
      }
    }

    // handle the last line:
    // when we hit the last line, if there're >= 20 seconds left,
    // we assume the last line take 5 seconds and insert outro with the rest
    // if there're < 20 seconds left, we assume the last line take the rest
    if (prev_line) {
      if (total_duration - prev_line.startTime > 20000) {
        // remaining = prev_line(5) + outro(remaining)
        const outro_start = prev_line.startTime + 5001
        prev_line.endTime = prev_line.startTime + 5000
        prev_line.words[0].endTime = prev_line.endTime
        result.push(prev_line)
        outro.startTime = outro_start
        outro.words[0].startTime = outro.startTime
        result.push(outro)
      } else {
        // remaining = prev_line(remaining)
        prev_line.endTime = total_duration
        prev_line.words[0].endTime = prev_line.endTime
        result.push(prev_line)
      }
    }

    return result
  }

  const fetch_and_parse_lyric = async (location, duration) => {
    try {
      const response = await fetch(`${location}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }
      const lrc = await response.text()
      return parse_lrc_to_ttml(lrc, duration)
    } catch (error) {
      console.error("Error fetching or parsing LRC file:", error)
    }
  }

  const format_time = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const get_remaining_time = (ms, duration) => {
    return format_time(duration * 1000 - ms)
  }

  const Playlist = ({ songs }) => {
    return (
      <PlaylistContainer>
        <PlaylistSummary>{calculate_playlist_duration(songs)}</PlaylistSummary>
        {songs.map((song, index) => (
          <PlaylistItemContainer key={index}>
            <PlaylistItem>
              <PlaylistItemAlbum>
                <PlaylistAlbum
                  src={`/audios/${id}/${song.id}/${song.cover}`}
                  alt={song.title}
                />
              </PlaylistItemAlbum>
              <PlaylistIndex>{index + 1}</PlaylistIndex>
              <PlaylistItemInfo>
                <PlaylistSongTitle>{song.title}</PlaylistSongTitle>
                <PlaylistSongArtist>{`${song.artist} • ${song.album}`}</PlaylistSongArtist>
              </PlaylistItemInfo>
            </PlaylistItem>
          </PlaylistItemContainer>
        ))}
      </PlaylistContainer>
    )
  }

  const PlayerControls = ({ songs, id }) => {
    const audio = useRef(new Audio())
    const [currentSong, setCurrentSong] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [currentLyric, setCurrentLyric] = useState([
      {
        words: [
          {
            startTime: 0,
            endTime: 0,
            word: "Loading...",
          },
        ],
        translatedLyric: "",
        romanLyric: "",
        startTime: 0,
        endTime: 0,
        isBG: false,
        isDuet: false,
      },
    ])

    const play = () => {
      audio.current.play()
      setIsPlaying(true)
    }

    const pause = () => {
      audio.current.pause()
      setIsPlaying(false)
    }

    const next = () => {
      setCurrentSong(currentSong < songs.length - 1 ? currentSong + 1 : 0)
    }

    const previous = () => {
      setCurrentSong(currentSong > 0 ? currentSong - 1 : songs.length - 1)
    }

    useEffect(() => {
      const song = songs[currentSong]
      audio.current.src = `/audios/${id}/${song.id}/${song.audio}`
      if (isPlaying) {
        play()
      }

      fetch_and_parse_lyric(
        `/audios/${id}/${songs[currentSong].id}/${songs[currentSong].lyrics}`,
        songs[currentSong].duration
      ).then((result) => {
        setCurrentLyric(result)
      })
    }, [currentSong])

    useEffect(() => {
      const handleTimeUpdate = () => {
        setCurrentTime(Math.floor(audio.current.currentTime * 1000)) // Convert to milliseconds
      }

      audio.current.addEventListener("timeupdate", handleTimeUpdate)

      return () => {
        audio?.current?.removeEventListener("timeupdate", handleTimeUpdate)
      }
    }, [isPlaying, currentSong])

    return (
      <PlayerControlContainer>
        <audio ref={audio} onEnded={next} hidden />

        <PlayerLyricContainer>
          <PlayerBackground
            albumImageUrl={`/audios/${id}/${songs[currentSong].id}/${songs[currentSong].cover}`}
          />
          <PlayerLyric
            lyricLines={currentLyric}
            currentTime={currentTime}
            onLyricLineClick={(evt) => {
              const updated_time = evt.line.lyricLine.startTime

              audio.current.currentTime = updated_time / 1000
              setCurrentTime(updated_time)
            }}
          />

          <PlayerControlGroups>
            <PlayerTitle>{`${songs[currentSong].title}`}</PlayerTitle>
            <PlayerArtist>{`${songs[currentSong].artist}`}</PlayerArtist>
            <PlayerProgressBar>
              <Progress
                percent={
                  (currentTime / (songs[currentSong].duration * 1000)) * 100
                }
                showInfo={false}
                strokeColor={"white"}
              />
            </PlayerProgressBar>
            <PlayerRemainingTime>
              <RemainingTime>{`${format_time(currentTime)}`}</RemainingTime>
              <RemainingTime>{`-${get_remaining_time(
                currentTime,
                songs[currentSong].duration
              )}`}</RemainingTime>
            </PlayerRemainingTime>
            <PlayerButtonContainer>
              <PlayerControlButton onClick={previous}>
                <BackwardOutlined />
              </PlayerControlButton>
              <PlayerControlButton onClick={isPlaying ? pause : play}>
                {isPlaying ? (
                  <PauseOutlined style={{ fontSize: "2em" }} />
                ) : (
                  <CaretRightOutlined />
                )}
              </PlayerControlButton>
              <PlayerControlButton onClick={next}>
                <ForwardOutlined />
              </PlayerControlButton>
            </PlayerButtonContainer>
          </PlayerControlGroups>
        </PlayerLyricContainer>
      </PlayerControlContainer>
    )
  }

  return (
    <MusicPlayerContainer>
      {!loading ? (
        isMobile ? (
          <>
            <PlayerControls songs={songs} id={id} />
            <Playlist songs={songs} />
          </>
        ) : (
          <>
            <Playlist songs={songs} />
            <PlayerControls songs={songs} id={id} />
          </>
        )
      ) : (
        <LoadingContainer>
          <Spin style={{ alignSelf: "center" }} />
        </LoadingContainer>
      )}
    </MusicPlayerContainer>
  )
}

export default MusicPlayer
