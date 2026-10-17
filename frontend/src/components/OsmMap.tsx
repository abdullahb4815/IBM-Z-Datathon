// OpenStreetMap via Leaflet inside a WebView. Needs no API key and works in Expo Go.
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import type { FoodBank } from '../api/types';
import { colors, urgencyColor } from '../theme';

interface Props {
  banks: FoodBank[];
  user?: { lat: number; lng: number };
}

// OSM's tile and Nominatim usage policies require an identifying Referer, which the WebView sends from this base URL.
const BASE_URL = 'https://github.com/abdullahb4815/IBM-Z-Datathon';

// Only centre on the user if they are this close to a food bank; otherwise show all food banks.
const NEARBY_KM = 50;

// The user's position is not baked into the HTML: it arrives later through setUser(), so the map
// can show straight away and isn't reloaded when the GPS fix comes in.
function buildHtml(banks: FoodBank[]): string {
  const markers = banks.map((b) => ({
    lat: b.lat,
    lng: b.lng,
    name: b.name,
    address: b.address,
    color: urgencyColor(b.needs[0]?.urgency ?? 0),
    needs: b.needs.slice(0, 3).map((n) => `${n.item} (${n.needed_qty})`),
  }));
  // Escape "<" so the data can't close the <script> tag early.
  const data = JSON.stringify({ markers, userColor: colors.primary, nearbyKm: NEARBY_KM }).replace(
    /</g,
    '\\u003c',
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map { height: 100%; margin: 0; }
    .popup { font-family: -apple-system, Roboto, sans-serif; min-width: 180px; }
    .popup b { font-size: 14px; }
    .popup .row { margin-top: 4px; font-size: 12px; }
    .popup .label { color: #6B7280; }
    .popup .needs { margin-top: 6px; font-size: 13px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const { markers, userColor, nearbyKm } = ${data};
    const map = L.map('map', { zoomControl: false });
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

    function row(label, value) {
      const r = el('div', 'row');
      r.appendChild(el('span', 'label', label + ': '));
      const v = el('span', null, value);
      r.appendChild(v);
      return { row: r, value: v };
    }

    // Reverse-geocode with Nominatim (max 1 request/second per its policy, so only on tap, and cached).
    const addressCache = {};
    async function lookupAddress(lat, lng) {
      const key = lat + ',' + lng;
      if (!addressCache[key]) {
        addressCache[key] = fetch(
          'https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=' + lat + '&lon=' + lng,
        )
          .then((r) => r.json())
          .then((j) => {
            const a = j.address || {};
            const street = [a.house_number, a.road].filter(Boolean).join(' ');
            const area = a.suburb || a.hamlet || a.village || a.town || a.city || '';
            return [street, area, a.postcode].filter(Boolean).join(', ') || j.display_name || 'Unknown';
          })
          .catch(() => {
            delete addressCache[key];
            return 'Unavailable';
          });
      }
      return addressCache[key];
    }

    const bounds = [];
    for (const m of markers) {
      const popup = el('div', 'popup');
      popup.appendChild(el('b', null, m.name));
      const address = row('Address', m.address || 'Loading…');
      popup.appendChild(address.row);
      popup.appendChild(row('Coordinates', m.lat.toFixed(5) + ', ' + m.lng.toFixed(5)).row);
      if (m.needs.length) {
        const needs = el('div', 'needs');
        needs.appendChild(el('div', 'label', 'Needs:'));
        for (const n of m.needs) needs.appendChild(el('div', null, '• ' + n));
        popup.appendChild(needs);
      }

      const marker = L.marker([m.lat, m.lng], {
        icon: L.divIcon({
          className: '',
          html: '<svg width="28" height="38" viewBox="0 0 28 38"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.3 21.7 0 14 0z" fill="' + m.color + '" stroke="#fff" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="#fff"/></svg>',
          iconSize: [28, 38],
          iconAnchor: [14, 38],
          popupAnchor: [0, -34],
        }),
      }).bindPopup(popup).addTo(map);

      if (!m.address) {
        marker.on('popupopen', async () => {
          address.value.textContent = await lookupAddress(m.lat, m.lng);
          marker.getPopup().update();
        });
      }
      bounds.push([m.lat, m.lng]);
    }

    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    else map.setView([53.48, -2.24], 11);

    // Called from React Native once the phone's location is known.
    let userMarker = null;
    let centredOnUser = false;
    window.setUser = (lat, lng) => {
      if (userMarker) userMarker.setLatLng([lat, lng]);
      else userMarker = L.circleMarker([lat, lng], {
        radius: 7, color: '#fff', weight: 3, fillColor: userColor, fillOpacity: 1,
      }).addTo(map);
      const nearby = bounds.some((b) => map.distance(b, [lat, lng]) / 1000 <= nearbyKm);
      if (nearby && !centredOnUser) {
        centredOnUser = true;
        map.setView([lat, lng], 13);
      }
    };
  </script>
</body>
</html>`;
}

export function OsmMap({ banks, user }: Props) {
  const ref = useRef<WebView>(null);
  const html = useMemo(() => buildHtml(banks), [banks]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => setLoaded(false), [html]);

  useEffect(() => {
    if (loaded && user) ref.current?.injectJavaScript(`window.setUser(${user.lat}, ${user.lng}); true;`);
  }, [loaded, user]);

  return (
    <WebView
      ref={ref}
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      source={{ html, baseUrl: BASE_URL }}
      onLoadEnd={() => setLoaded(true)}
    />
  );
}
