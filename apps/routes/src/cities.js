// Preset networks: the city only biases search and the map position — routing itself is not limited to it.
export const CITIES = [
  { id: 'warszawa', name: 'Warszawa', sub: 'metro, tram, bus, SKM', lat: 52.2297, lon: 21.0122, live: 'warsaw' },
  { id: 'krakow', name: 'Kraków', sub: 'tram, bus', lat: 50.0647, lon: 19.9450 },
  { id: 'wroclaw', name: 'Wrocław', sub: 'tram, bus', lat: 51.1079, lon: 17.0385 },
  { id: 'poznan', name: 'Poznań', sub: 'tram, bus', lat: 52.4082, lon: 16.9335 },
  { id: 'trojmiasto', name: 'Trójmiasto', sub: 'Gdańsk, Gdynia, Sopot · tram, bus, SKM', lat: 54.4000, lon: 18.5900 },
  { id: 'lodz', name: 'Łódź', sub: 'tram, bus', lat: 51.7592, lon: 19.4560 },
  { id: 'katowice', name: 'Katowice (GZM)', sub: 'Upper Silesia · tram, bus', lat: 50.2649, lon: 19.0238 },
  { id: 'lublin', name: 'Lublin', sub: 'bus, trolleybus', lat: 51.2465, lon: 22.5684 },
  { id: 'szczecin', name: 'Szczecin', sub: 'tram, bus', lat: 53.4285, lon: 14.5528 },
  { id: 'bydgoszcz', name: 'Bydgoszcz', sub: 'tram, bus', lat: 53.1235, lon: 18.0084 },
  { id: 'torun', name: 'Toruń', sub: 'tram, bus', lat: 53.0138, lon: 18.5984 },
  { id: 'bialystok', name: 'Białystok', sub: 'bus', lat: 53.1325, lon: 23.1688 },
  { id: 'rzeszow', name: 'Rzeszów', sub: 'bus', lat: 50.0412, lon: 21.9991 },
  { id: 'kielce', name: 'Kielce', sub: 'bus', lat: 50.8661, lon: 20.6286 },
  { id: 'olsztyn', name: 'Olsztyn', sub: 'tram, bus', lat: 53.7784, lon: 20.4801 },
  { id: 'opole', name: 'Opole', sub: 'bus', lat: 50.6751, lon: 17.9213 },
  { id: 'radom', name: 'Radom', sub: 'bus', lat: 51.4027, lon: 21.1471 },
  { id: 'czestochowa', name: 'Częstochowa', sub: 'tram, bus', lat: 50.8118, lon: 19.1203 },
  { id: 'zielonagora', name: 'Zielona Góra', sub: 'bus', lat: 51.9356, lon: 15.5062 },
  { id: 'gorzow', name: 'Gorzów Wielkopolski', sub: 'tram, bus', lat: 52.7325, lon: 15.2288 }
];
export const cityById = id => CITIES.find(c => c.id === id) || CITIES[0];
// lower-case, without Polish diacritics (so "lodz" finds "Łódź")
export const fold = s => String(s || '').toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/[̀-ͯ]/g, '');
