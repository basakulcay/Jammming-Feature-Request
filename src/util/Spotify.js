import axios from 'axios';

const clientId = '411655ad9f7b4ec7b257c2ea1fcf9633';
const redirectUri = 'http://localhost:3000/callback/';

let accessToken;
const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    //check for access token match
    const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);
    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      let expiresIn = Number(expiresInMatch[1]);
      //This clears the parameters, allowing to grab new access token then it expires
      window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
      window.location = accessUrl;
    }
  },
  search(term) {
    const accessToken = Spotify.getAccessToken();

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((response) => {
        return response.json();
      })
      .then((jsonResponse) => {
        if (!jsonResponse.tracks) {
          return [];
        }
        return jsonResponse.tracks.items.map((track) => ({
          id: track.id,
          name: track.name,
          artists: track.artists[0].name,
          album: track.album.name,
          uri: track.uri,
        }));
      });
  },

  async getPlaylist(id){
    let userID;
    let playlist_id;
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {const res =  await axios.get(`https://api.spotify.com/v1/users/${userID}/playlists/${playlist_id}/tracks`, 
        {headers: headers});
      console.log(res.data);
      return res.data;} 
    catch (error) {
      console.log('ERROR', error, error.response);
  }},
  //Added code to bring the user's spotify playlist
  async bringPlaylist() {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    try {
      const res = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: headers,
      });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.log('ERROR', error, error.response);
    }
  },
  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
   

    return fetch('https://api.spotify.com/v1/me', { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        
        return fetch(`https://api.spotify.com/v1/me/playlists`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistID = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/me/playlists/${playlistID}/tracks`,
              {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({ uris: trackUris }),
              }
            );
          });
      });
  }, // end of savePlaylist method
}; // end of Spotify object

export default Spotify;
