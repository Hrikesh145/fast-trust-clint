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
import PaymentHistory from "../pages/DashBoard/PaymentHistory/PaymentHistory";
import TrackParcel from "../pages/DashBoard/TrackParcel/Trackparcel";
import BeARider from "../pages/BeARider/BeARider";
import PendingRiders from "../pages/BeARider/PendingRiders";
import ActiveRiders from "../pages/BeARider/ActiveRiders";
import AdminUsers from "../pages/DashBoard/AdminUsers/AdminUsers";


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
        },
        {
          path:"beARider",
          element:<PrivateRoute><BeARider></BeARider></PrivateRoute>
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
      },
      {
        path:"paymentHistory",
        Component:PaymentHistory
      },
      {
        path:"activeRiders",
        Component:ActiveRiders
      },
      {
        path:"pendingRiders",
        Component:PendingRiders
      },
      {
        path:"track",
        Component:TrackParcel
      },
      {
        path:"admin-users",
        Component:AdminUsers
      }
    ]

  }
]);