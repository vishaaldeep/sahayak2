import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaGFhbGRlZXAiLCJhIjoiY21kNWduOG43MHAyZzJrczlxanVwZWlraCJ9.TN2zhZbhbpuZJZnbMJ3MbQ';

const skillColors = {
  'JavaScript': '#FF5733',
  'Python': '#33FF57',
  'Java': '#3357FF',
  'Plumbing': '#8B4513',
  'Electrician': '#FFD700',
  'Carpentry': '#A0522D',
  'Cooking': '#FFB347',
  'Driving': '#4682B4',
  'Gardening': '#228B22',
  'Painting': '#800080',
};

const HARDCODED_USER_LOCATION = { lng: 76.798698, lat: 30.690418 };

function JobsHeatmap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const userMarker = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [activeSkills, setActiveSkills] = useState(Object.keys(skillColors));
  const [modalJobs, setModalJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCoords, setModalCoords] = useState(null);

  // Fetch jobs in a 100km radius around the user's location
  const fetchJobs = async (center) => {
    if (!center) return;
    const res = await fetch(`http://localhost:5000/api/jobs-in-radius?center=${center.lng},${center.lat}&radius=100`);
    const data = await res.json();
    setJobs(data);
  };

  // Get user's real-time location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserLocation(HARDCODED_USER_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        setUserLocation(HARDCODED_USER_LOCATION);
      }
    );
  }, []);

  // Initialize map when userLocation is available
  useEffect(() => {
    if (!userLocation || map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/vishaaldeep/cmd5gqybe00qq01s91mqd8nmy', // Outdoor style
      center: [userLocation.lng, userLocation.lat],
      zoom: 9,
    });

    map.current.on('load', () => {
      fetchJobs(userLocation);

      map.current.addSource('jobs', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add a heatmap layer for each skill
      Object.entries(skillColors).forEach(([skill, color]) => {
        map.current.addLayer({
          id: `heatmap-${skill}`,
          type: 'heatmap',
          source: 'jobs',
          paint: {
            'heatmap-weight': 1, // Every job counts fully
            'heatmap-intensity': 4, // Reduced intensity
            'heatmap-radius': 13, // Slightly larger, but still focused
            'heatmap-opacity': 0.5, // Lighter
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0,0,0,0)',
              0.01, color,
              0.1, color,
              0.2, 'yellow',
              0.4, 'orange',
              1, 'red'
            ],
          },
          filter: ['==', ['get', 'skill'], skill],
        });
      });

      // Add user location marker
      userMarker.current = new mapboxgl.Marker({ color: '#0074D9' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map.current);
    });
  }, [userLocation]);

  // Update heatmap layer visibility based on activeSkills
  useEffect(() => {
    if (!map.current) return;
    Object.keys(skillColors).forEach(skill => {
      const layerId = `heatmap-${skill}`;
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(
          layerId,
          'visibility',
          activeSkills.includes(skill) ? 'visible' : 'none'
        );
      }
    });
  }, [activeSkills, jobs]);

  // Update jobs data on map
  useEffect(() => {
    if (!map.current) return;
    const features = jobs.map(job => ({
      type: 'Feature',
      geometry: job.location,
      properties: {
        skill: job.skill,
        count: 1, // or aggregate if needed
        ...job,
      },
    }));
    const geojson = { type: 'FeatureCollection', features };
    map.current.getSource('jobs')?.setData(geojson);
  }, [jobs]);

  // Refetch jobs if userLocation changes
  useEffect(() => {
    if (userLocation) {
      fetchJobs(userLocation);
      if (map.current && userMarker.current) {
        userMarker.current.setLngLat([userLocation.lng, userLocation.lat]);
        map.current.setCenter([userLocation.lng, userLocation.lat]);
      }
    }
  }, [userLocation]);

  // Click handler for hotspots
  useEffect(() => {
    if (!map.current) return;
    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      // Try to use jobs already loaded in frontend for this area
      const jobsNearby = jobs.filter(job => {
        if (!job.location || !job.location.coordinates) return false;
        const [jobLng, jobLat] = job.location.coordinates;
        // Haversine formula for ~1km radius
        const R = 6371; // km
        const dLat = (jobLat - lat) * Math.PI / 180;
        const dLng = (jobLng - lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat * Math.PI / 180) * Math.cos(jobLat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        return distance <= 1;
      });
      if (jobsNearby.length > 0) {
        setModalJobs(jobsNearby);
        setModalCoords({ lng, lat });
        setModalOpen(true);
      } else {
        // Fallback: fetch from backend
        fetch(`http://localhost:5000/api/jobs-in-radius?center=${lng},${lat}&radius=1`)
          .then(res => res.json())
          .then(jobsFetched => {
            setModalJobs(jobsFetched);
            setModalCoords({ lng, lat });
            setModalOpen(true);
          });
      }
    });
  }, [jobs]);

  // Legend and filter UI + Modal
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {/* Legend and Filter */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20, background: 'rgba(255,255,255,0.95)',
        padding: 14, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', zIndex: 2,
        minWidth: 180
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Skill Legend & Filter</div>
        {Object.entries(skillColors).map(([skill, color]) => (
          <div key={skill} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
            <span style={{
              display: 'inline-block', width: 18, height: 18, background: color,
              borderRadius: 4, marginRight: 8, border: '1px solid #888'
            }} />
            <label style={{ flex: 1, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={activeSkills.includes(skill)}
                onChange={e => {
                  setActiveSkills(
                    e.target.checked
                      ? [...activeSkills, skill]
                      : activeSkills.filter(s => s !== skill)
                  );
                }}
                style={{ marginRight: 4 }}
              />
              {skill}
            </label>
          </div>
        ))}
      </div>
      {/* Modal for job details */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            position: 'relative', maxHeight: '80vh', overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
            <h2 style={{ margin: '0 0 12px 0', fontSize: 22, color: '#333' }}>Jobs in this area</h2>
            {modalJobs.length === 0 ? (
              <div style={{ color: '#888', fontStyle: 'italic' }}>No jobs found here.</div>
            ) : (
              modalJobs.map((job, idx) => (
                <div key={job._id || idx} style={{
                  border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12,
                  background: '#fafbfc', boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: 16, color: skillColors[job.skill] || '#333' }}>{job.title}</div>
                  <div style={{ fontSize: 14, color: '#555', margin: '4px 0 2px 0' }}>{job.description}</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Skill: <span style={{ color: skillColors[job.skill] || '#333' }}>{job.skill}</span></div>
                  <div style={{ fontSize: 13, color: '#888' }}>Wage: ₹{job.wage_per_hour}/hr</div>
                  <div style={{ fontSize: 13, color: '#888' }}>Active: {job.is_active ? 'Yes' : 'No'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsHeatmap; 