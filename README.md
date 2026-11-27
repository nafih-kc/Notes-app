# Notes App

A React notes application with persistent JSON Server storage. The interface supports creating, editing, deleting, pinning, archiving, searching, and sorting notes.

## Features

- Create, edit, and delete notes
- Add multiple tags and choose a note color
- Pin notes and view archived notes
- Search note titles, content, and tags
- Sort notes by most recently updated, title, or color
- Store note data in db.json through a REST API
- Manage API state with React Context and Axios
- Show loading indicators, error messages, and action notifications

## Technology

- React and Vite
- Tailwind CSS
- React Context API
- Axios
- JSON Server 0.17.4

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting Started

1. Clone this repository and open its folder.
2. Install dependencies by running **npm install**.
3. Start the JSON Server API in one terminal with **npm run server**.
4. Start the React development server in a second terminal with **npm run dev**.
5. Open the local address printed by Vite, usually http://localhost:5173.

The API runs at http://localhost:3001. Notes are available at http://localhost:3001/notes. Keep the JSON Server terminal running while using the app. Changes made through the app are saved to db.json.

## API Routes

JSON Server provides the following routes for the notes collection:

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /notes | List notes |
| POST | /notes | Create a note |
| PUT | /notes/:id | Replace a note |
| PATCH | /notes/:id | Update selected note fields |
| DELETE | /notes/:id | Delete a note |

The frontend uses http://localhost:3001 by default. To use another API host, create a .env file in the project root and set VITE_API_URL=http://localhost:3001. Set VITE_API_URL to the API origin only; the app adds the /notes resource path.

## Note Data

Each note stores an id, title, content, color, tags, archived, stock, createdAt, and updatedAt. The pinned field is also stored to retain the existing pin feature.

Tags is an array of strings. Stock is retained as a numeric field for the assignment schema and defaults to 0.

## Production Build

Create a production build with **npm run build**.

The app requires a reachable JSON Server API at runtime. A static GitHub Pages deployment cannot connect to a JSON Server running on your own computer. Deploy the API to a reachable host and set VITE_API_URL before building if you need a public deployment.

## Project Structure

- src/components/ contains the header, note form, and note list.
- src/App.jsx contains the existing app layout and filters.
- src/NotesContext.tsx manages notes and API state.
- src/main.jsx mounts the app and notifications.
- db.json stores the notes collection.

