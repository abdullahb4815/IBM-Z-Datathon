// OpenStreetMap via Leaflet inside a WebView. Needs no API key and works in Expo Go.
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { FoodBank } from '../api/types';
import { colors, urgencyColor } from '../theme';

interface Props {
  banks: FoodBank[];
  center: { lat: number; lng: number };
  user?: { lat: number; lng: number };
}

// OSM's tile usage policy requires an identifying Referer, which the WebView sends from this base URL.
const BASE_URL = 'https://github.com/abdullahb4815/IBM-Z-Datathon';

function buildHtml({ banks, center, user }: Props): string {
  const markers = banks.map((b) => ({
    lat: b.lat,
    lng: b.lng,
    name: b.name,
    address: b.address,
    color: urgencyColor(b.needs[0]?.urgency ?? 0),
    needs: b.needs.slice(0, 3).map((n) => `${n.item} (${n.needed_qty})`),
  }));
  // Escape "</" so the data can't close the <script> tag early.
  const data = JSON.stringify({ markers, center, user, userColor: colors.primary }).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .popup b { font-size: 14px; }
    .popup .sub { color: #6B7280; font-size: 12px; margin: 2px 0 4px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const { markers, center, user, userColor } = ${data};
    const map = L.map('map', { zoomControl: false }).setView([center.lat, center.lng], 14);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    function el(tag, className, text) {
      const e = document.createElement(tag);
      if (className) e.className = className;
      if (text) e.textContent = text;
      return e;
    }

    for (const m of markers) {
      const popup = el('div', 'popup');
      popup.appendChild(el('b', null, m.name));
      popup.appendChild(el('div', 'sub', m.address));
      for (const n of m.needs) popup.appendChild(el('div', null, '• ' + n));

      L.circleMarker([m.lat, m.lng], {
        radius: 11, color: '#fff', weight: 2, fillColor: m.color, fillOpacity: 1,
      }).bindPopup(popup).addTo(map);
    }

    if (user) {
      L.circleMarker([user.lat, user.lng], {
        radius: 7, color: '#fff', weight: 3, fillColor: userColor, fillOpacity: 1,
      }).addTo(map);
    }
  </script>
</body>
</html>`;
}

export function OsmMap(props: Props) {
  return (
    <WebView
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      source={{ html: buildHtml(props), baseUrl: BASE_URL }}
    />
  );
}
