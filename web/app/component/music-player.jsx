import { useState, useEffect, useRef } from "react"
import styled from "styled-components"
import { CONST } from "../util"
import axios from "axios"

import { LyricPlayer, BackgroundRender } from "@applemusic-like-lyrics/react"

const MusicPlayerContainer = styled.div`
  display: flex;
  width: 85%;
  margin: 2em auto;

  /* Border & shadow */
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 0 40px -10px rgba(0, 0, 0, 0.3),
    0 0 25px -15px rgba(0, 0, 0, 0.2);
`

const PlaylistContainer = styled.div`
  width: 50%;
  overflow-y: scroll;
  max-height: 30em;
  scrollbar-width: none;
`

const PlayerControlContainer = styled.div`
  width: 50%;

  display: flex;
  flex-direction: column;
`

const PlaylistItemContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 0.2rem;
  border-bottom: 1px solid #eee;
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
  cursor: pointer;
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
  position: relative; /* Establishes a positioning context for children */
  height: 25em;
`

const PlayerBackground = styled(BackgroundRender)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  border-radius: 0 6px 0 0;
  overflow: hidden;
`

const PlayerLyric = styled(LyricPlayer)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
`

const PlayerControlGroups = styled.div`
  display: flex;
  justify-content: space-between;
`

const PlayerTitle = styled.div``

const PlayerArtist = styled.div``

const PlayerProgressBar = styled.div``

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
    const parse_duration = (duration) => {
      const [minutes, seconds] = duration.split(":").map(Number)
      return minutes + seconds / 60
    }

    const total_duration = songs.reduce(
      (sum, song) => sum + parse_duration(song.duration),
      0
    )

    const hours = Math.floor(total_duration / 60)
    const minutes = Math.round(total_duration % 60)

    const hour_text = hours === 1 ? "hour" : "hours"
    const minute_text = minutes === 1 ? "minute" : "minutes"
    const song_text = songs.length === 1 ? "song" : "songs"

    let message = `${songs.length} ${song_text}, `
    if (hours > 0) {
      message += `${hours} ${hour_text}`
      if (minutes > 0) {
        message += ` and ${minutes} ${minute_text}`
      }
    } else if (minutes > 0) {
      message += `${minutes} ${minute_text}`
    } else {
      message += "0 minutes"
    }

    return message
  }

  const parse_lrc_to_ttml = (lrc) => {
    const pattern = /\[(\d+):(\d+\.\d+)\]\s*(.+)/
    const lines = lrc.split("\n")
    let result = []
    let previousEndTime = 0

    for (let i = 0; i < lines.length; i++) {
      const match = pattern.exec(lines[i])
      if (match) {
        const minutes = parseInt(match[1], 10)
        const seconds = parseFloat(match[2])
        const word = match[3]
        const startTime = previousEndTime
        const endTime = minutes * 60 * 1000 + seconds * 1000 // Convert to milliseconds

        result.push({
          words: [
            {
              startTime: startTime,
              endTime: endTime,
              word: word,
            },
          ],
          translatedLyric: "",
          romanLyric: "",
          startTime: startTime,
          endTime: endTime,
          isBG: false,
          isDuet: false,
        })

        previousEndTime = endTime // Update previous end time for the next iteration
      }
    }

    return result
  }

  const fetch_and_parse_lyric = async (location) => {
    console.log(location)

    try {
      const response = await fetch(`${location}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }
      const lrc = await response.text()
      return parse_lrc_to_ttml(lrc)
    } catch (error) {
      console.error("Error fetching or parsing LRC file:", error)
    }
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
              <PlaylistIndex>{index}</PlaylistIndex>
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
        `/audios/${id}/${songs[currentSong].id}/${songs[currentSong].lyrics}`
      ).then((result) => {
        console.log(result)
        setCurrentLyric(result)
      })
    }, [currentSong])

    return (
      <PlayerControlContainer>
        <audio ref={audio} onEnded={next} hidden />

        <PlayerLyricContainer>
          <PlayerBackground
            albumImageUrl={`/audios/${id}/${songs[currentSong].id}/${songs[currentSong].cover}`}
          />
          <PlayerLyric
            lyricLines={currentLyric}
            currentTime={15000} // FIXME: This is a placeholder
            // onLyricLineClick={(evt) => {
            //   console.log(evt)
            // }}
          />
        </PlayerLyricContainer>

        <PlayerTitle>{`${songs[currentSong].title}`}</PlayerTitle>
        <PlayerArtist>{`${songs[currentSong].artist}`}</PlayerArtist>

        <PlayerControlGroups>
          <button onClick={previous}>Previous</button>
          <button onClick={isPlaying ? pause : play}>
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button onClick={next}>Next</button>
        </PlayerControlGroups>
      </PlayerControlContainer>
    )
  }

  return (
    <MusicPlayerContainer>
      {!loading && (
        <>
          <Playlist songs={songs} />
          <PlayerControls songs={songs} id={id} />
        </>
      )}
    </MusicPlayerContainer>
  )
}

export default MusicPlayer
