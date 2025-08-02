# Civic Track - Issue Reporter

A full-stack application for reporting and tracking civic issues in your neighborhood. The project consists of a Spring Boot backend API and a React-like frontend with mapping capabilities.

## Design Reference

The UI/UX design for this application is based on the following Figma designs:
- **Design File**: [Civic Track Mobile UI Design](https://www.figma.com/design/1Bzyl85MatwuX9ZfZdEOhU/Civic-Track-Mobile-UI?node-id=9-44&t=tsjkSxmVdE1v9y5d-0)
- **Interactive Prototype**: [Civic Track Mobile UI Prototype](https://www.figma.com/proto/1Bzyl85MatwuX9ZfZdEOhU/Civic-Track-Mobile-UI?node-id=9-44&t=tsjkSxmVdE1v9y5d-0&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=69%3A345)

## Project Structure

```
├── issue-reporter/          # Backend (Spring Boot)
│   ├── src/main/java/com/civictrack/
│   │   ├── controller/      # REST API endpoints
│   │   ├── model/          # Data models
│   │   ├── service/        # Business logic
│   │   └── repository/     # Data access layer
│   └── pom.xml
├── TRACKERR/               # Frontend (HTML/CSS/JS)
│   ├── index.html          # Main application
│   ├── script.js           # JavaScript logic
│   └── style.css           # Styling
└── README.md
```

## Features

### Backend (Spring Boot)
- RESTful API for issue management
- H2 in-memory database
- CORS configuration for frontend integration
- Issue filtering by status, category, and location
- Photo upload support (base64)
- Anonymous reporting option

### Frontend (HTML/CSS/JS)
- Mobile-responsive design based on Figma UI/UX
- Interactive map using Leaflet.js
- Real-time location detection
- Issue reporting form with photo upload
- Filter issues by status, category, and distance
- Anonymous reporting option

## Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Modern web browser

### Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd issue-reporter
   ```

2. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

3. The backend will start on `http://localhost:8080`

4. Access the H2 database console at `http://localhost:8080/h2-console`
   - JDBC URL: `jdbc:h2:mem:testdb`
   - Username: `sa`
   - Password: `password`

### Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd TRACKERR
   ```

2. Open `index.html` in your web browser
   - You can use a local server like Live Server in VS Code
   - Or simply double-click the HTML file

3. The frontend will automatically connect to the backend at `http://localhost:8080`

## API Endpoints

### Issue Management
- `POST /api/issues/report` - Report a new issue
- `GET /api/issues` - Get filtered issues
- `PUT /api/issues/{id}/status` - Update issue status
- `POST /api/issues/{id}/flag` - Flag an issue

### Query Parameters for GET /api/issues
- `status` - Filter by status (REPORTED, IN_PROGRESS, RESOLVED)
- `category` - Filter by category (ROADS, WATER, ELECTRICITY, WASTE, PUBLIC_SAFETY, OTHER)
- `lat` - User latitude for distance filtering
- `lon` - User longitude for distance filtering
- `radiusKm` - Search radius in kilometers (default: 5)

## Integration Details

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:5500`
- `file://` (for local file access)

### Frontend-Backend Communication
- Frontend makes API calls to `http://localhost:8080/api`
- Real-time location detection for issue reporting
- Automatic map updates when new issues are reported
- Error handling with fallback to mock data

### Data Flow
1. User fills out issue report form
2. Frontend sends POST request to `/api/issues/report`
3. Backend validates and saves issue to database
4. Frontend refreshes map to show new issue
5. Users can filter and view issues on the map

## Development

### Backend Development
- The application uses H2 in-memory database for development
- Database schema is auto-generated from JPA entities
- All API endpoints are RESTful and follow Spring Boot conventions

### Frontend Development
- Pure HTML/CSS/JavaScript (no build process required)
- Uses Leaflet.js for mapping functionality
- Mobile-first responsive design
- Real-time form validation

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running on port 8080 and CORS is properly configured
2. **Map Not Loading**: Check if Leaflet.js CDN is accessible
3. **Location Not Working**: Ensure HTTPS or localhost for geolocation API
4. **Database Issues**: Check H2 console at `http://localhost:8080/h2-console`

### Debug Mode
- Backend logs are set to DEBUG level
- Frontend console logs show API calls and responses
- Check browser developer tools for frontend errors

## Future Enhancements

- User authentication and profiles
- File upload for photos (currently base64)
- Push notifications for issue updates
- Admin dashboard for issue management
- Mobile app development
- Real-time notifications using WebSockets 