# SkillLearn — Student Course Registration (3-Tier DevOps Project)

A simple 3-tier web application for student course registration, deployed using a CI/CD pipeline with Jenkins, Docker, and Nginx on AWS EC2.

## Architecture

```
[ User Browser ]
        |
        | HTTP (public internet)
        v
[ EC2-1 : Frontend Tier — Public IP ]
   - Nginx serves static files (index.html, app.js, style.css)
   - Nginx reverse-proxies /api/* requests to the backend
        |
        | Internal VPC traffic only (private IP)
        v
[ EC2-2 : Backend Tier — Private IP ]
   - Node.js + Express API running inside a Docker container
   - SQLite database for storing student registrations
```

**Key design decision:** The backend has no public IP and is not directly reachable from the internet. The frontend's Nginx acts as a reverse proxy, forwarding all `/api/` calls internally over the VPC to the backend's private IP. This keeps the backend fully private while still letting the browser talk to it indirectly.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Web server (frontend) | Nginx (installed directly on EC2-1 host) |
| Backend | Node.js, Express |
| Database | SQLite (file-based) |
| Containerization | Docker (backend only) |
| CI/CD | Jenkins |
| Hosting | AWS EC2 (2 instances) |

## Project Structure

```
.
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── backend/
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── nginx.conf
├── Jenkinsfile
└── README.md
```

## How It Works

1. Browser loads the frontend from `http://<EC2-1-public-ip>/`.
2. `app.js` calls the API using **relative paths** (`API_URL = ""`), e.g. `fetch("/api/students")`.
3. Since the URL has no domain, the browser automatically sends the request to whichever server served the page — i.e., EC2-1.
4. Nginx on EC2-1 matches the `/api/` location block and proxies the request internally to `http://<EC2-2-private-ip>:5000/api/...`.
5. The Node.js backend handles the request, reads/writes to SQLite, and returns JSON.
6. Nginx relays the response back to the browser.

This means the backend's security group only needs to allow port `5000` from EC2-1's private IP — never from the public internet.

## API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/courses` | List available courses |
| POST | `/api/register` | Register a student (name, email, phone, course) |
| GET | `/api/students` | List all registered students |

## CI/CD Pipeline (Jenkins)

The `Jenkinsfile` automates the full deployment:

1. **Checkout** — pulls source from GitHub.
2. **Frontend validation** — confirms `index.html`, `app.js`, `style.css` exist.
3. **Backend build & test** — `npm install`, syntax check with `node --check`.
4. **Docker build** — builds the backend image, tagged with the Jenkins build number.
5. **Deploy backend to EC2-2** — ships the image over SSH, stops/removes the old container, and starts a new one with a **persistent volume** mounted for the SQLite database file (so data survives redeploys).
6. **Deploy frontend to EC2-1** — copies static files to `/var/www/html`.
7. **Nginx reload** — validates and reloads the Nginx config.
8. **Health check** — confirms the backend is reachable.

### Data Persistence

The backend container is stateless by default — every redeploy replaces the container, which would normally wipe the SQLite database. To prevent data loss, the pipeline mounts only the database file (not the whole app directory) from the host into the container:

```bash
docker run -v /home/ubuntu/student-data/students.db:/app/students.db ...
```

This keeps `students.db` on the EC2-2 host filesystem, so it persists across container restarts and redeploys.

## Local Setup (for development)

**Backend:**
```bash
cd backend
npm install
node server.js
# runs on http://localhost:5000
```

**Frontend:**
Open `frontend/index.html` directly, or serve it with any static file server. Update `API_URL` in `app.js` to point at your local backend if not using a reverse proxy.

## Common Issues & Fixes (Lessons Learned)

| Issue | Cause | Fix |
|---|---|---|
| Registration silently fails, form does nothing | `app.js` had a `#`-style comment (Python/Bash syntax) instead of `//` (JavaScript syntax), causing a `SyntaxError` that broke the entire script | Always use `//` for JS comments, never `#` |
| Browser can't reach the API | `API_URL` was hardcoded to the backend's **private IP** (`10.x.x.x`), which is unreachable from outside the VPC | Use `API_URL = ""` (relative path) + Nginx reverse proxy |
| Data disappears after every deploy | `docker rm` removes the old container along with its writable layer, where SQLite stored data | Mount the DB file as a Docker volume so it lives on the host |
| Backend container fails to start after adding a volume | Mounting a host folder directly onto `/app` overwrites the container's application code (`server.js`, `node_modules`) | Mount only the specific DB **file**, not the whole `/app` directory |

## Security Notes

- Backend is never exposed to the public internet — only reachable via the frontend's internal Nginx proxy.
- CORS is currently wide open (`cors()` with no options) — consider restricting allowed origins for production.
- No input sanitization beyond presence checks — consider validating email format and escaping user-submitted data before rendering (to prevent XSS via `innerHTML`).

## License

Internal training / demo project.
