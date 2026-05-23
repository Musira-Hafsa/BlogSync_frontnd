# BlogSync 📰

A bold, magazine-style full-stack blogging platform built with the MERN stack and Cloudinary for image delivery.

---

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React 18 + Vite + React Router v6 |
| Styling   | Custom CSS (magazine editorial design system) |
| Backend   | Node.js + Express 4 |
| Database  | MongoDB + Mongoose |
| Auth      | JWT (jsonwebtoken) + bcryptjs |
| Images    | Cloudinary (cover images + avatars) |
| Upload    | Multer + multer-storage-cloudinary |

---

## Project Structure

```
blogsync/
├── server/                          # Express backend
│   ├── .env                         # ← copy from .env.example, fill in values
│   ├── index.js                     # entry point
│   ├── package.json
│   ├── config/
│   │   └── cloudinary.js            # Cloudinary SDK config
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification
│   │   └── upload.js                # Multer + Cloudinary storage
│   ├── models/
│   │   ├── User.js
│   │   ├── Blog.js
│   │   └── Comment.js
│   └── routes/
│       ├── auth.js                  # POST /api/auth/register|login
│       ├── blog.js                  # CRUD /api/blogs
│       ├── comments.js              # /api/comments/:blogId
│       ├── upload.js                # POST /api/upload/cover|avatar
│       └── users.js                 # GET|PUT /api/users
│
└── client/                          # React + Vite frontend
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx                 # React DOM entry
        ├── App.jsx                  # Router + all routes
        ├── index.css                # Global reset + CSS tokens
        ├── api/
        │   ├── axios.js             # Shared Axios instance (auto JWT)
        │   └── uploadImage.js       # Cloudinary upload + URL helper
        └── pages/
            ├── AuthPages.jsx        # Login + Signup
            ├── Home.jsx             # Magazine feed
            ├── BlogPost.jsx         # Full reading view
            ├── Editor.jsx           # Write + publish
            └── Profile.jsx          # Author profile
```

---

## Setup

### 1. Clone / create folder

```bash
mkdir blogsync && cd blogsync
```

### 2. Backend

```bash
cd server
npm install

# Copy env file and fill in your values
cp .env.example .env
```

Required `.env` values:

| Key | Where to get it |
|-----|----------------|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → Connect → Drivers |
| `JWT_SECRET` | Any long random string |
| `CLOUDINARY_CLOUD_NAME` | [Cloudinary Dashboard](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard |

```bash
# Start backend
npm run dev        # uses nodemon (auto-restarts)
# or
npm start          # plain node
```

Server starts at **http://localhost:5000**

### 3. Frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

---

## API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login`    | — | Login, returns JWT |

### Blogs
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/api/blogs`           | —    | Public feed (supports `?author=id`) |
| GET    | `/api/blogs/:id`       | —    | Single post (increments views) |
| POST   | `/api/blogs`           | ✅   | Create post |
| PUT    | `/api/blogs/:id`       | ✅   | Update post (owner only) |
| PATCH  | `/api/blogs/:id/like`  | ✅   | Toggle like |
| DELETE | `/api/blogs/:id`       | ✅   | Delete post (owner only) |

### Comments
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET    | `/api/comments/:blogId` | —  | Get all comments for a post |
| POST   | `/api/comments/:blogId` | ✅ | Post a comment |
| DELETE | `/api/comments/:id`     | ✅ | Delete own comment |

### Upload (Cloudinary)
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST   | `/api/upload/cover`       | ✅ | Upload blog cover (max 8MB) |
| POST   | `/api/upload/avatar`      | ✅ | Upload avatar (max 4MB) |
| DELETE | `/api/upload/:public_id`  | ✅ | Delete image from Cloudinary |

### Users
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/users/:handle` | —  | Public profile |
| PUT | `/api/users/me`      | ✅ | Update own profile (name, handle, bio, avatar) |

---

## Cloudinary Image Flow

```
User picks file
  → instant local blob preview (zero delay)
  → XHR POST to /api/upload/cover (with progress %)
    → multer-storage-cloudinary streams to Cloudinary
    → Cloudinary applies transformations (resize, WebP, quality auto)
    → returns secure_url
  → frontend swaps blob preview → Cloudinary URL
  → URL saved in Blog.banner or User.avatar in MongoDB
```

### Inline transformations (free, via URL)

```js
import { cloudinaryUrl } from "./api/uploadImage";

// Auto quality + WebP
cloudinaryUrl(url, "f_auto,q_auto")

// Thumbnail 400×300
cloudinaryUrl(url, "w_400,h_300,c_fill,f_auto,q_auto")

// Hero banner 1400×560
cloudinaryUrl(url, "w_1400,h_560,c_fill,f_auto,q_auto")
```

---

## Pages

| Route | Page | Auth required |
|-------|------|---------------|
| `/` | Home — magazine feed, ticker, hero, tag filter | No |
| `/auth` | Login / Signup | No |
| `/blog/:id` | Blog post reading view | No |
| `/profile/:handle` | Author profile + stats | No |
| `/editor` | Write + publish | **Yes** |

---

## Deployment

### Backend (Railway / Render)
1. Push `server/` to a repo
2. Set all env variables in the dashboard
3. Build command: `npm install`
4. Start command: `node index.js`

### Frontend (Vercel / Netlify)
1. Push `client/` to a repo
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add env var: `VITE_API_URL=https://your-backend.railway.app/api`
5. Update `axios.js` baseURL to use `import.meta.env.VITE_API_URL`

---

## License

MIT — free to use and build on.

