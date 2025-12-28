export const SOUNDCLOUD_CLIENT_ID = 'RF8yvumNwWwVg0aX4r7fHqzIVAtO6nSI';

export const SC_API_V2 = 'https://api-v2.soundcloud.com';

// Minimum duration in milliseconds for "long-form mix" filtering.
// 3 600 000 ms = 1 hour
export const MIN_MIX_DURATION_MS = 3_600_000;

// How many tracks to request per search page
export const SEARCH_LIMIT = 50;

// Genres available in the picker (value sent to the API, label shown to user)
export const GENRES = [
  { value: 'alternativerock', label: 'Alternative Rock' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'classical', label: 'Classical' },
  { value: 'country', label: 'Country' },
  { value: 'danceedm', label: 'Dance & EDM' },
  { value: 'deephouse', label: 'Deep House' },
  { value: 'disco', label: 'Disco' },
  { value: 'drumbass', label: 'Drum & Bass' },
  { value: 'dubstep', label: 'Dubstep' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'folksingersongwriter', label: 'Folk' },
  { value: 'hiphoprap', label: 'Hip-Hop & Rap' },
  { value: 'house', label: 'House' },
  { value: 'indie', label: 'Indie' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'latin', label: 'Latin' },
  { value: 'metal', label: 'Metal' },
  { value: 'piano', label: 'Piano' },
  { value: 'pop', label: 'Pop' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'reggaeton', label: 'Reggaeton' },
  { value: 'rock', label: 'Rock' },
  { value: 'soundtrack', label: 'Soundtrack' },
  { value: 'techno', label: 'Techno' },
  { value: 'trance', label: 'Trance' },
  { value: 'trap', label: 'Trap' },
  { value: 'triphop', label: 'Trip-Hop' },
  { value: 'world', label: 'World' },
];
