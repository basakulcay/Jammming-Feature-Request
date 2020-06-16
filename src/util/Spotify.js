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
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
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
  //Added code to bring the user's spotify playlist
  async bringPlaylist() {
    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    //==== FOR YOUR LEARNING SAKE===//
    // axios.get('https://api.spotify.com/v1/playlists',{headers:headers}).then(res => {
    //   console.log(res.data)
    // return res.data
    // })

    ///  this code is the same thing as above, but uses async await instead of .then() ///
    try {
      const res = await axios.get('https://api.spotify.com/v1/playlists', {
      headers: headers
    })
    console.log(res.data)
    return res.data
    } catch (error) {
      console.log('ERROR', error, error.response)
    }
    

    // return fetch('https://api.spotify.com/v1/playlists', { headers: headers }).then(res => {
    //   return res.json()
    // }).then(data => {
    //   console.log('respnse data', data)
    //   return data
    // }).catch(err => {
    //   console.log(err)
    //   throw new Error('Request Failed')
    // })
  }
  ,
  savePlaylist(name, trackUris) {
    if (!name || !trackUris.length) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };
    let userID;

    return fetch('https://api.spotify.com/v1/me', { headers: headers })
      .then((response) => response.json())
      .then((jsonResponse) => {
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ name: name }),
        })
          .then((response) => response.json())
          .then((jsonResponse) => {
            const playlistID = jsonResponse.id;
            return fetch(
              `https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`,
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
