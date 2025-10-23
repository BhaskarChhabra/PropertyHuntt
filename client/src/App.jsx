import HomePage from "./routes/homePage/homePage";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ListPage from "./routes/listPage/listPage";
import { Layout, RequireAuth } from "./routes/layout/layout";
import SinglePage from "./routes/singlePage/singlePage";
import ProfilePage from "./routes/profilePage/profilePage";
import Login from "./routes/login/login";
import Register from "./routes/register/register";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import AIPropertyHub from "./routes/aiPropertyHub/AIPropertyHub"; // new page
import InvestmentPage from "./routes/investmentPage/InvestmentPage"; // fixed casing
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import { GoogleOAuthProvider } from "@react-oauth/google"; // <--- THE REAL IMPORT

// !!! IMPORTANT: Replace this with your actual Google Client ID from the Google Cloud Console !!!
// In a real project, this should be loaded from your environment variables: 
// const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_ID = "73037730787-5clbbd0634me9hsqfuj12f79429tq20j.apps.googleusercontent.com"; 

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
        },
        {
          path: "/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        // Public AI pages
        {
          path: "/ai-property-hub",
          element: <AIPropertyHub />,
        },
        {
          path: "/investment-insights",
          element: <InvestmentPage />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
      ],
    },
  ]);

  return (
    // We wrap the RouterProvider with the GoogleOAuthProvider so that 
    // the Google context is available everywhere in your application.
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
    </GoogleOAuthProvider>
  );
}

export default App;
