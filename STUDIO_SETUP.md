# MindTurn Studio — Setup Guide

## 1. Set your admin email
Open `src/Constants/AdminConfig.js` and replace the placeholder with the
email address you sign in with:

```js
export const ADMIN_EMAILS = ["saluankesakshi@gmail.com"];
```

Only this email will see the "Studio" link in the navbar and be able to
open `/studio`.

## 2. Add Firestore security rules
Go to Firebase Console → Firestore Database → Rules, and add this block
(merge it with whatever rules you already have for LikedMovies/MyList/etc):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /CustomVideos/{videoId} {
      // Anyone signed in can read/watch
      allow read: if request.auth != null;

      // Only your admin email can create or delete videos
      allow create: if request.auth != null
                    && request.auth.token.email == "saluankesakshi@gmail.com";
      allow delete: if request.auth != null
                    && request.auth.token.email == "saluankesakshi@gmail.com";

      // Any signed-in user can update views/likes/comments/watch time
      // (this is what lets viewers like/comment/generate view counts)
      allow update: if request.auth != null;
    }

    match /SiteAnalytics/{docId} {
      // Anyone signed in can read the aggregate stats (used by the
      // Studio analytics dashboard's category/total-views breakdown)
      allow read: if request.auth != null;
      // Any signed-in user can update it (this is what lets viewer
      // actions like watching/liking bump the totals)
      allow write: if request.auth != null;
    }

    match /FeaturedBanner/{slideId} {
      // Anyone signed in can see the home page banner slides
      allow read: if request.auth != null;
      // Only your admin email can add/remove banner slides
      allow write: if request.auth != null
                   && request.auth.token.email == "saluankesakshi@gmail.com";
    }

    match /Series/{seriesId} {
      // Anyone signed in can see series/playlists
      allow read: if request.auth != null;
      // Only your admin email can create/remove series
      allow write: if request.auth != null
                   && request.auth.token.email == "saluankesakshi@gmail.com";
    }

    match /WatchHistory/{uid} {
      // Each user can only read/write their own watch history
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

The rules below already use your email (saluankesakshi@gmail.com) — just copy-paste them as-is.

## 3. How uploading works
No Firebase Storage is used anywhere in Studio — this avoids needing the
paid Blaze plan entirely (as of Feb 2026, Firebase requires Blaze even for
free-tier Storage usage).

1. Upload your video to YouTube as **Unlisted**.
2. Upload a thumbnail image to a free image host — e.g.
   [postimages.org](https://postimages.org) (no account needed) — and copy
   the **"Direct link"** it gives you.
3. Go to `/studio/upload`, paste the YouTube link + the thumbnail image URL,
   add title/description/category, and publish.
4. Streaming/bandwidth is handled entirely by YouTube — free, no limits.

Series thumbnails (`/studio/series`) and Featured Banner slides
(`/studio/featured`) work the same way — paste an image URL, no upload.

> Heads-up: the **Profile picture** upload (Settings page) still uses
> Firebase Storage directly and was not part of this build — if you try to
> change your profile picture, you'll hit the same "upgrade to Blaze" wall.
> Let me know if you'd like that switched to a URL-based approach too.

## 4. What tracks automatically
- **Views** — +1 every time someone opens the watch page
- **Watch time** — logged every 15 seconds while the video is actually playing
- **Likes** — toggle button on the watch page
- **Comments** — signed-in users can post comments
- All of this feeds the graph on `/studio/analytics`

## 5. New routes added
- `/studio` — dashboard (admin only)
- `/studio/upload` — upload form (admin only)
- `/studio/content` — manage/delete videos (admin only)
- `/studio/analytics` — views/watch-time graph (admin only)
- `/watch/:id` — public watch page for any uploaded video

## 6. All the Firestore collections, explained
You never need to manually create these in the console — they're created
automatically the first time the app writes to them (first signup, first
upload, first view). Here's what each one holds:

| Collection | What it stores | Created when |
|---|---|---|
| `Users` | email + uid for every signed-up user | someone signs up |
| `MyList` / `LikedMovies` / `WatchedMovies` | ⚠️ legacy — left over from the original TMDB template, no longer written to. The **My List** and **Liked** pages now read from `CustomVideos` instead (see below) | — |
| `CustomVideos` | one doc per uploaded video: title, category, views, likes, comments, `savedBy` (uids who added it to My List), watch time, view/watch history | admin publishes a video |
| `SiteAnalytics` (single doc: `global`) | site-wide totals (`totalViews`, `totalLikes`, `totalVideos`) **and** a per-category breakdown (`categories.Motivational.views`, `.likes`, `.videoCount`, etc.) — this is what powers the "Category performance" table on `/studio/analytics` | first video view/like/upload happens
| `FeaturedBanner` | the 5–6 home page hero slides (title, description, image, optional linked video) — managed only from `/studio/featured` | admin adds a slide
| `Series` | playlists grouping several uploaded videos into one series (title, thumbnail, list of video IDs) — managed only from `/studio/series` | admin creates a series
| `WatchHistory` | one doc per user (keyed by uid), a capped list of the last 30 videos they watched — powers the **History** page | someone opens a watch page while signed in

Auth users themselves (email, password hash, last sign-in) live in
**Firebase Authentication → Users tab** — that's separate from Firestore
and Google manages it for you automatically.

## 8. Deploying to Render
1. Push your code to GitHub (if not done already).
2. Go to [render.com](https://render.com) → sign in with GitHub.
3. **"New" → "Static Site"** → pick your repo.
4. Settings:
   - **Build Command:** `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory:** `dist`
5. **"Create Static Site"** — first deploy takes a couple minutes.
6. **Add the SPA rewrite rule** (required — without this, refreshing any page
   other than the homepage, like `/studio` or `/watch/xyz`, will 404):
   - On your site's Render dashboard → **"Redirects/Rewrites"** tab
   - **Add Rule:** Source `/*` → Destination `/index.html` → Action **Rewrite**
   - Save.
7. Once live, copy the `.onrender.com` URL and add it to **Firebase Console
   → Authentication → Settings → Authorized domains** (same step as for
   Vercel) — otherwise sign-in will fail on the live site.

## 9. Still worth doing later
- The frontend check (`isAdminEmail`) keeps the UI hidden from non-admins,
  but the **Firestore rules in step 2 are what actually enforce security**.
  Don't skip step 2, or anyone could technically call the upload function
  directly.
- `npm install` again after pulling these changes — `recharts` was added
  to `package.json` for the analytics graph.
