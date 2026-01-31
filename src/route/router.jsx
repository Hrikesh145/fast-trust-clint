import { createBrowserRouter } from "react-router";
import RootLayout from "../layout/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layout/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import PrivateRoute from "../routes/privateRoute";
import SendParcel from "../pages/SendParcel/SendParcel";
import DashBoardLayout from "../layout/DashBoardLayout";
import MyParcels from "../pages/DashBoard/MyParcels/MyParcels";
import Payment from "../pages/Payment/Payment";

export const router = createBrowserRouter([
  {
    path: "/",
    Component:RootLayout,
    children:[
        {
            index:true,
            Component:Home
        },
        {
          path:"coverage",
          Component:Coverage
        },
        {
          path:"sendParcel",
          element:<PrivateRoute><SendParcel></SendParcel></PrivateRoute>
        }
    ]
  },
  {
    path:"/",
    Component:AuthLayout,
    children:[
      {
        path:"login",
        Component:Login
      },
      {
        path:"register",
        Component:Register
      }
    ]
  },
  {
    path:"/dashboard",
    element:<PrivateRoute>
      <DashBoardLayout></DashBoardLayout>
    </PrivateRoute>,
    children:[
      {
        path:"myParcels",
        Component:MyParcels,
      },
      {
        path:"payment/:parcelId",
        Component:Payment
      }
    ]

  }
]);