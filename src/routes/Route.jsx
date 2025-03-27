import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Authen/Login";
import RootLayout from "../layout/RootLayout";
import NotFound from "../pages/NotFound";
import PrivateRoute from "./PrivateRoute";
import Home from "../pages/Home";
import Chat from "../pages/Chat";
import Premium from "../pages/Premium";
import Listener from "../pages/Listener";
import Blog from "../pages/Blog";
import SignUp from "../pages/Authen/SignUp";
import Friends from "../pages/Friends";
import PersonalLayout from "../layout/PersonalLayout";
import Verify from "../pages/Authen/Verify";
import Deposit from "../pages/Deposit";
import DepositDetail from "../pages/Deposit/DepositDetail";
import PaymentSuccess from "../pages/Deposit/PaymentSuccess";
import PaymentFailed from "../pages/Deposit/PaymentFailed";
import BlogDetail from "../pages/Blog/BlogDetail";
import Profile from "../pages/Profile";
import FriendsList from "../pages/Friends/FriendsList";
import FriendsRequests from "../pages/Friends/FriendsRequests";
import Call from "../pages/Call";
import CallWindow from "../pages/Call/CallWindow";
import MyBlog from "../pages/MyBlog";
import MyBlogDetail from "../pages/MyBlog/MyBlogDetail";

const ROLES = {
  CUSTOMER: "Customer",
  LISTENER: "Listener",
  ADMIN: "Admin",
};
const publicRoutes = [
  { index: true, element: <Home /> },
  { path: "/home", element: <Home /> },
  { path: "/premium", element: <Premium /> },
  { path: "/listeners", element: <Listener /> },
  { path: "/blogs", element: <Blog /> },
  { path: "/blogs/:id", element: <BlogDetail /> },
];

const customerRoutes = [
  {
    path: "chats",
    element: <Chat />,
  },
  {
    path: "friends",
    element: <Friends />,
    children: [
      {
        index: true,
        element: <FriendsList />,
      },
      {
        path: "requests",
        element: <FriendsRequests />,
      },
    ],
  },
  { path: "calls", element: <Call /> },
  { path: "myBlog", element: <MyBlog /> },
  { path: "myBlog/:id", element: <MyBlogDetail /> },
  { path: "call/random", element: <CallWindow /> },
  { path: "deposit", element: <Deposit /> },
  { path: "deposit/detail", element: <DepositDetail /> },
  { path: "success", element: <PaymentSuccess /> },
  { path: "failed", element: <PaymentFailed /> },
  { path: "profile", element: <Profile /> },
];
export const router = createBrowserRouter([
  { path: "login", element: <Login /> },
  { path: "sign-up", element: <SignUp /> },
  { path: "verify-otp", element: <Verify /> },
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      {
        element: <PrivateRoute allowedRoles={ROLES.CUSTOMER} />,
        children: customerRoutes,
      },
    ],
  },
  {
    path: "/personal",
    element: <PersonalLayout />,
    children: [
      {
        element: <PrivateRoute allowedRoles={ROLES.CUSTOMER} />,
        children: customerRoutes,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
