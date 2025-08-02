// script.js
const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
  document.getElementById('civicForm').addEventListener('submit', handleFormSubmission);
  addValidationListeners();
  document.querySelector('.notification-icon').addEventListener('click', () => alert('No new notifications'));
  document.querySelector('.menu-icon').addEventListener('click', () => alert('Menu clicked'));
}

async function handleFormSubmission(e) {
  e.preventDefault();
  if (!validateForm()) return;
  
  const btn = document.querySelector('.submit-btn');
  showLoadingState(btn);
  
  try {
    const data = collectFormData();
    const response = await submitIssueToBackend(data);
    
    hideLoadingState(btn);
    showSuccessMessage();
    resetForm();
    
    // Refresh the map with new data
    await fetchAndDisplayIssues();
    
    console.log('Issue reported successfully:', response);
  } catch (error) {
    hideLoadingState(btn);
    showErrorMessage('Failed to submit issue. Please try again.');
    console.error('Error submitting issue:', error);
  }
}

async function submitIssueToBackend(data) {
  const response = await fetch(`${API_BASE_URL}/issues/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: data.title,
      description: data.description,
      category: data.category,
      anonymous: data.anonymous,
      latitude: userLocation.lat,
      longitude: userLocation.lon,
      photos: data.photos.map(photo => photo.name) // For now, just send photo names
    })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

function validateForm() {
  let valid = true;
  clearErrors();
  const title = document.getElementById('issueTitle').value.trim();
  if (!title || title.length < 5) {
    showError('issueTitle', !title ? 'Title required' : 'Title min 5 chars');
    valid = false;
  }
  const desc = document.getElementById('issueDescription').value.trim();
  if (!desc || desc.length < 10) {
    showError('issueDescription', !desc ? 'Description required' : 'Desc min 10 chars');
    valid = false;
  }
  const cat = document.getElementById('issueCategory').value;
  if (!cat) {
    showError('issueCategory', 'Select a category');
    valid = false;
  }
  return valid;
}

function showError(id, msg) {
  const el = document.getElementById(id), grp = el.parentElement;
  grp.classList.add('error');
  let err = grp.querySelector('.error-message');
  if (!err) {
    err = document.createElement('div');
    err.className = 'error-message';
    grp.appendChild(err);
  }
  err.textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(e => e.remove());
  document.querySelectorAll('.input-group').forEach(g => g.classList.remove('error','success'));
}

function addValidationListeners() {
  ['issueTitle','issueDescription','issueCategory'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => validateField(id));
    el.addEventListener('input', () => {
      if (el.parentElement.classList.contains('error')) validateField(id);
    });
  });
}

function validateField(id) {
  const val = document.getElementById(id).value.trim();
  clearFieldError(id);
  if (id==='issueTitle') {
    if (!val) showError(id,'Title required');
    else if(val.length<5) showError(id,'Title min 5 chars');
  }
  if (id==='issueDescription') {
    if (!val) showError(id,'Description required');
    else if(val.length<10) showError(id,'Desc min 10 chars');
  }
  if (id==='issueCategory') {
    if (!val) showError(id,'Select a category');
  }
}

function clearFieldError(id) {
  const grp = document.getElementById(id).parentElement;
  grp.classList.remove('error');
  const err = grp.querySelector('.error-message');
  if (err) err.remove();
}

function showLoadingState(btn) {
  btn.disabled = true; btn.classList.add('loading'); btn.textContent='SUBMITTING...';
}

function hideLoadingState(btn) {
  btn.disabled = false; btn.classList.remove('loading'); btn.textContent='SUBMIT';
}

function showSuccessMessage() {
  const msg = document.createElement('div');
  msg.className='success-message';
  msg.textContent='Issue reported successfully!';
  document.body.appendChild(msg);
  setTimeout(()=> msg.classList.add('show'),100);
  setTimeout(()=> { msg.classList.remove('show'); setTimeout(()=>msg.remove(),300); },3000);
}

function showErrorMessage(message) {
  const msg = document.createElement('div');
  msg.className='error-message-global';
  msg.textContent=message;
  document.body.appendChild(msg);
  setTimeout(()=> msg.classList.add('show'),100);
  setTimeout(()=> { msg.classList.remove('show'); setTimeout(()=>msg.remove(),300); },3000);
}

function collectFormData() {
  return {
    title:document.getElementById('issueTitle').value.trim(),
    description:document.getElementById('issueDescription').value.trim(),
    category:document.getElementById('issueCategory').value,
    anonymous:document.getElementById('reportAnonymously').checked,
    photos:getUploadedPhotos(),
    timestamp:new Date().toISOString()
  };
}

function triggerFileInput(n) {
  document.getElementById('photo'+n).click();
}

function handleFileUpload(n) {
  const inp = document.getElementById('photo'+n), box = inp.parentElement;
  if (inp.files[0]) {
    const f=inp.files[0];
    if(!f.type.startsWith('image/')) { alert('Select an image'); inp.value=''; return; }
    if(f.size>5*1024*1024) { alert('Max 5MB'); inp.value=''; return; }
    box.classList.add('has-image');
    box.querySelector('i').className='fas fa-check';
  }
}

function getUploadedPhotos() {
  const photos = [];
  for(let i=1;i<=3;i++){
    const f=document.getElementById('photo'+i).files[0];
    if(f) photos.push({name:f.name,size:f.size,type:f.type});
  }
  return photos;
}

function resetForm() {
  document.getElementById('civicForm').reset();
  for(let i=1;i<=3;i++){
    const box=document.getElementById('photo'+i).parentElement;
    box.classList.remove('has-image');
    box.querySelector('i').className='fas fa-plus';
  }
  clearErrors();
}

// --- CONFIGURATION ---
const DEFAULT_LOCATION = { lat: 12.9716, lon: 77.5946 }; // fallback (Bangalore center)
const NEIGHBORHOOD_RADIUS_KM = 5; // Max allowed zone
let userLocation = { ...DEFAULT_LOCATION };
let allIssues = []; // To be loaded from backend/server
let map, userMarker, issueMarkers = [];

// --- LOCATION DETECTION ---
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        userLocation.lat = pos.coords.latitude;
        userLocation.lon = pos.coords.longitude;
        if (callback) callback();
      },
      err => { 
        console.log('Location error:', err);
        if (callback) callback(); 
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 6000 }
    );
  } else {
    if (callback) callback();
  }
}

// --- MAP INITIALIZATION ---
function initMap() {
  map = L.map('map').setView([userLocation.lat, userLocation.lon], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    { maxZoom: 19 }).addTo(map);
  userMarker = L.marker([userLocation.lat, userLocation.lon], {icon: L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25,41], iconAnchor: [12,41] })})
    .addTo(map)
    .bindPopup('You Are Here');
}

function updateUserMarker() {
  if (userMarker) userMarker.setLatLng([userLocation.lat, userLocation.lon]).openPopup();
}

// --- HAVERSINE DISTANCE ---
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2-lat1)*Math.PI/180, dLon = (lon2-lon1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- BACKEND API: Fetch Issues ---
async function fetchIssues(callback) {
  try {
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const distanceFilter = document.getElementById('distanceFilter').value;
    
    let url = `${API_BASE_URL}/issues?radiusKm=${distanceFilter}`;
    if (statusFilter) url += `&status=${statusFilter}`;
    if (categoryFilter) url += `&category=${categoryFilter}`;
    if (userLocation.lat && userLocation.lon) {
      url += `&lat=${userLocation.lat}&lon=${userLocation.lon}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    allIssues = await response.json();
    console.log('Fetched issues:', allIssues);
    
    if (callback) callback();
  } catch (error) {
    console.error('Error fetching issues:', error);
    // Fallback to mock data if API fails
    allIssues = [
      { id:1, title:"Pothole on 3rd St", latitude:12.9720, longitude:77.5940, category:"ROADS", status:"REPORTED" },
      { id:2, title:"Broken lamp", latitude:12.9702, longitude:77.5904, category:"ELECTRICITY", status:"IN_PROGRESS" },
      { id:3, title:"Overflowing bin", latitude:12.9766, longitude:77.5931, category:"WASTE", status:"RESOLVED" },
    ];
    if (callback) callback();
  }
}

// --- FILTER, VISIBILITY & PIN HANDLING ---
function filterAndDisplayIssues() {
  // Only show issues within NEIGHBORHOOD_RADIUS_KM (visibility restriction)
  const allowedDistanceKm = parseInt(document.getElementById('distanceFilter').value);
  const statusValue = document.getElementById('statusFilter').value;
  const categoryValue = document.getElementById('categoryFilter').value;

  // Show/hide map warning if user is out of allowed zone
  document.getElementById('outside-zone-msg').style.display = allowedDistanceKm > NEIGHBORHOOD_RADIUS_KM ? "block":"none";

  // Remove old issue markers
  issueMarkers.forEach(m=> map.removeLayer(m));
  issueMarkers = [];

  // Filter issues
  const visibleIssues = allIssues.filter(issue => {
    const dist = getDistanceKm(userLocation.lat, userLocation.lon, issue.latitude, issue.longitude);
    issue.distance = dist;
    if (dist > allowedDistanceKm) return false;
    if (statusValue && issue.status !== statusValue) return false;
    if (categoryValue && issue.category !== categoryValue) return false;
    return true;
  });

  // Show pins for allowed, filtered issues
  visibleIssues.forEach(issue => {
    const marker = L.marker([issue.latitude, issue.longitude]).addTo(map).bindPopup(
      `<b>${issue.title}</b><br>Category: ${issue.category}<br>Status: ${issue.status}`
    );
    issueMarkers.push(marker);
  });

  // Optional: Zoom to markers if any
  if (visibleIssues.length) {
    const group = new L.featureGroup(issueMarkers);
    map.fitBounds(group.getBounds().extend([userLocation.lat, userLocation.lon]), {padding: [40,40]});
  } else {
    map.setView([userLocation.lat, userLocation.lon], 15); // fallback
  }
}

// --- EVENT WIRING ---
function setupMapFilters() {
  ['distanceFilter','statusFilter','categoryFilter'].forEach(id =>
    document.getElementById(id).addEventListener('change', async () => {
      await fetchAndDisplayIssues();
      filterAndDisplayIssues();
    })
  );
}

// --- MANUAL LOCATION OPTION ---
function enableManualLocation() {
  // For a button, call this and re-init map and user position
  const lat = prompt("Enter latitude:", userLocation.lat);
  const lon = prompt("Enter longitude:", userLocation.lon);
  if (lat && lon) {
    userLocation.lat = parseFloat(lat);
    userLocation.lon = parseFloat(lon);
    updateUserMarker();
    fetchAndDisplayIssues().then(() => filterAndDisplayIssues());
  }
}

// --- INITIALIZE ALL ---
async function fetchAndDisplayIssues() {
  await fetchIssues(() => {
    filterAndDisplayIssues();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  getUserLocation(() => {
    initMap();
    fetchAndDisplayIssues();
    setupMapFilters();
  });

  // Optionally, make a "Change Location" button
  // document.querySelector('.your-class').addEventListener('click', enableManualLocation);
});
