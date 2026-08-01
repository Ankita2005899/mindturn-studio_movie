import { useEffect, useContext, lazy, Suspense } from "react";
import "./App.css";

const Home = lazy(() => import("./Pages/Home"));
const Series = lazy(() => import("./Pages/Series"));
const Search = lazy(() => import("./Pages/Search"));
const Profile = lazy(() => import("./Pages/Profile"));
const MyList = lazy(() => import("./Pages/MyList"));
const SignIn = lazy(() => import("./Pages/SignIn"));
const SignUp = lazy(() => import("./Pages/SignUp"));
const Welcome = lazy(() => import("./Pages/Welcome"));
const ErrorPage = lazy(() => import("./Pages/ErrorPage"));
const Play = lazy(() => import("./Pages/Play"));
const LikedMovies = lazy(() => import("./Pages/LikedMovies"));
const History = lazy(() => import("./Pages/History"));
const WatchCustom = lazy(() => import("./Pages/WatchCustom"));
const StudioDashboard = lazy(() => import("./Pages/Studio/StudioDashboard"));
const StudioUpload = lazy(() => import("./Pages/Studio/StudioUpload"));
const StudioContent = lazy(() => import("./Pages/Studio/StudioContent"));
const StudioAnalytics = lazy(() => import("./Pages/Studio/StudioAnalytics"));
const StudioFeatured = lazy(() => import("./Pages/Studio/StudioFeatured"));
const StudioSeries = lazy(() => import("./Pages/Studio/StudioSeries"));
const SeriesWatch = lazy(() => import("./Pages/SeriesWatch"));
import ProtectedAdminRoute from "./Pages/Studio/ProtectedAdminRoute";

import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./Context/UserContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "./componets/Loading/Loading";
import Navbar from "./componets/Header/Navbar";
import NavbarWithoutUser from "./componets/Header/NavbarWithoutUser";

function App() {
  const { User, setUser } = useContext(AuthContext);
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user);
    });
  }, []);

  return (
    <div>
      {User ? <Navbar/> : <NavbarWithoutUser/>}
      <Suspense replace fallback={<Loading />}>
        <Routes>
          <Route index path="/" element={User ? <Home /> : <Welcome />} />
          {User ? (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/series" element={<Series />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/mylist" element={<MyList />} />
              <Route path="/liked" element={<LikedMovies />} />
              <Route path="/history" element={<History />} />
              <Route path="/play/:id" element={<Play />} />
              <Route path="/watch/:id" element={<WatchCustom />} />

              <Route
                path="/studio"
                element={
                  <ProtectedAdminRoute>
                    <StudioDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/studio/upload"
                element={
                  <ProtectedAdminRoute>
                    <StudioUpload />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/studio/content"
                element={
                  <ProtectedAdminRoute>
                    <StudioContent />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/studio/analytics"
                element={
                  <ProtectedAdminRoute>
                    <StudioAnalytics />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/studio/featured"
                element={
                  <ProtectedAdminRoute>
                    <StudioFeatured />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/studio/series"
                element={
                  <ProtectedAdminRoute>
                    <StudioSeries />
                  </ProtectedAdminRoute>
                }
              />
            </>
          ) : null}
          <Route path="/originals-series/:id" element={<SeriesWatch />} />
          <Route path="/play/:id" element={<Play />} />

          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
