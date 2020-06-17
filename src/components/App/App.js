import React from 'react';
import './App.css';
import { SearchBar } from '../SearchBar/SearchBar';
import { SearchResults } from '../SearchResults/SearchResults.js';
import { Playlist } from '../Playlist/Playlist.js';
import Spotify from '../../util/Spotify.js';
import SpotifyPlaylist from '../spotifyPlaylist/spotifyPlaylist';

class App extends React.Component {

  state = {
    searchResults: [],
    playlistName: 'My Playlist',
    playlistTracks: [],
    spotifyList: [],
  };


  addTrack(track) {
    let tracks = this.state.playlistTracks;
    if (tracks.find((savedTracks) => savedTracks.id === track.id)) {
      return;
    }
    tracks.push(track);
    this.setState({ playlistTracks: tracks });
  }

  removeTrack(track) {
    let tracks = this.state.playlistTracks;
    tracks = tracks.filter((currentTrack) => currentTrack.id !== track.id);
    this.setState({ playlistTracks: tracks });
  }

  updatePlaylistName(name) {
    this.setState({ playlistName: name });
  }

  savePlaylist() {
    const trackUris = this.state.playlistTracks.map((track) => track.uri);
    Spotify.savePlaylist(this.state.playlistName, trackUris).then(() => {
      this.setState({ playlistName: 'New Playlist', playlistTracks: [] });
    });
  }

  search(term) {
    Spotify.search(term).then((searchResults) => {
      this.setState({ searchResults: searchResults });
    });
  }

  componentWillMount() {
    Spotify.bringPlaylist().then(list => {
      console.log("state", list)
      this.setState({ spotifyList: list.items, loading: false });
    }
    ).catch(error => {
      this.setState({ loading: false, error });
    });
  }

  render() {
    const { error, loading } = this.state;
    if (error) { return <div>Error: {error.message}</div>; }
    else if (loading) { return <div>Loading...</div>; }
    else {
      return (
        <div>
          <h1>
            Ja<span className="highlight">mmm</span>ing
        </h1>
          <div className="App">
            <SearchBar onSearch={this.search.bind(this)} />
            <div className="App-playlist">
              <SearchResults onAdd={this.addTrack.bind(this)} searchResults={this.state.searchResults} />
              <Playlist
                playlistName={this.state.playlistName}
                playlistTracks={this.state.playlistTracks}
                onRemove={this.removeTrack.bind(this)}
                onNameChange={this.updatePlaylistName.bind(this)}
                onSave={this.savePlaylist.bind(this)}
              />
              <SpotifyPlaylist
                spotifyList={this.state.spotifyList}
              />
            </div>
          </div>
        </div>
      );
    }
  }
}

export default App;
