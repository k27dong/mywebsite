import styled from "styled-components"
import { CONST } from "../util"

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
  font-size: 20px;
`

const PlaylistSongArtist = styled.div`
  font-size: 14px;
`

const PlaylistSummary = styled.div`
  padding-left: 0.8rem;
  font-size: 15px;
  color: ${CONST.COLORS.TEXT};
`

const PlaylistIndex = styled.div`
  place-self: center;
  margin: 0 0.3rem;
  font-weight: bold;
`

const MusicPlayer = ({ id }) => {
  const songs = [
    {
      title: "Don't Be So Serious",
      artist: "Low Roar",
      duration: "4:15",
      cover_img: "url_to_cover_img_1",
      album: "Once in a Long, Long While...",
      lyrics: "Lyrics for Eternal Dawn",
      audio_file: "path_to_audio_file_1",
    },
    {
      title: "Whispering Wind",
      artist: "Melodic Breeze",
      duration: "3:52",
      cover_img: "url_to_cover_img_2",
      album: "Nature's Melody",
      lyrics: "Lyrics for Whispering Wind",
      audio_file: "path_to_audio_file_2",
    },
    {
      title: "Rhythmic Journey",
      artist: "Beats Explorer",
      duration: "4:30",
      cover_img: "url_to_cover_img_3",
      album: "Urban Beats",
      lyrics: "Lyrics for Rhythmic Journey",
      audio_file: "path_to_audio_file_3",
    },
    {
      title: "Harbor Lights",
      artist: "Seaside Orchestra",
      duration: "5:03",
      cover_img: "url_to_cover_img_4",
      album: "Ocean's Serenade",
      lyrics: "Lyrics for Harbor Lights",
      audio_file: "path_to_audio_file_4",
    },
    {
      title: "Desert Mirage",
      artist: "Sandy Echoes",
      duration: "4:47",
      cover_img: "url_to_cover_img_5",
      album: "Arid Dreams",
      lyrics: "Lyrics for Desert Mirage",
      audio_file: "path_to_audio_file_5",
    },
    {
      title: "Starry Nights",
      artist: "Galactic Harmony",
      duration: "3:35",
      cover_img: "url_to_cover_img_6",
      album: "Cosmic Tunes",
      lyrics: "Lyrics for Starry Nights",
      audio_file: "path_to_audio_file_6",
    },
    {
      title: "Rainforest Whisper",
      artist: "Jungle Melody",
      duration: "4:22",
      cover_img: "url_to_cover_img_7",
      album: "Wild Sounds",
      lyrics: "Lyrics for Rainforest Whisper",
      audio_file: "path_to_audio_file_7",
    },
    {
      title: "Urban Echo",
      artist: "City Vibes",
      duration: "3:40",
      cover_img: "url_to_cover_img_8",
      album: "Street Rhythms",
      lyrics: "Lyrics for Urban Echo",
      audio_file: "path_to_audio_file_8",
    },
    {
      title: "Winter's Tale",
      artist: "Frosty Notes",
      duration: "5:15",
      cover_img: "url_to_cover_img_9",
      album: "Cold Melodies",
      lyrics: "Lyrics for Winter's Tale",
      audio_file: "path_to_audio_file_9",
    },
    {
      title: "Sunny Afternoon",
      artist: "Summer Breeze",
      duration: "3:58",
      cover_img: "url_to_cover_img_10",
      album: "Warm Vibes",
      lyrics: "Lyrics for Sunny Afternoon",
      audio_file: "path_to_audio_file_10",
    },
  ]

  const Playlist = ({ songs }) => {
    return (
      <PlaylistContainer>
        <PlaylistSummary>{`10 songs, 1 hour 12 minutes`}</PlaylistSummary>
        {songs.map((song, index) => (
          <PlaylistItemContainer key={index}>
            <PlaylistItem>
              <PlaylistItemAlbum>
                <PlaylistAlbum
                  src={
                    "https://www.udiscovermusic.com/wp-content/uploads/2017/08/Pink-Floyd-Dark-Side-Of-The-Moon.jpg"
                  }
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

  const PlayerControls = () => {
    return <PlayerControlContainer>hello</PlayerControlContainer>
  }

  return (
    <MusicPlayerContainer>
      <Playlist songs={songs} />
      <PlayerControls />
    </MusicPlayerContainer>
  )
}

export default MusicPlayer
