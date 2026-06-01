import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import AddVehiclePage from "./pages/AddVehiclePage";
import VehiclesPage from "./pages/VehiclesPage";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLayout from "./components/AdminLayout";
import ListingsPage from "./pages/ListingsPage";
import ChatPage from "./pages/ChatPage";

import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import BookingPage from "./pages/BookingPage";
import BookingPaymentPage from "./pages/BookingPaymentPage";
import OwnerApplicationPage from "./pages/OwnerApplicationPage";
import AdminVerificationPage from "./pages/AdminVerificationPage";
import AdminCarVerificationPage from "./pages/AdminCarVerificationPage";
import AdminCarsPage from "./pages/AdminCarsPage";
import AdminRentalsPage from "./pages/AdminRentalsPage";
import AdminPaymentsPage from "./pages/AdminPaymentsPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import RequestMechanicPage from "./pages/RequestMechanicPage";
import MyMechanicRequestsPage from "./pages/MyMechanicRequestsPage";
import MechanicRequestDetailPage from "./pages/MechanicRequestDetailPage";
import MechanicDashboardPage from "./pages/MechanicDashboardPage";
import AdminMechanicsPage from "./pages/AdminMechanicsPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserDetailsPage from "./pages/AdminUserDetailsPage";

import SellerLayout from "./components/SellerLayout";
import SellerDashboardPage from "./pages/SellerDashboardPage";
import SellerFleetPage from "./pages/SellerFleetPage";
import SellerBookingsPage from "./pages/SellerBookingsPage";
import SellerMechanicRequestsPage from "./pages/SellerMechanicRequestsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/add-vehicle" element={<AddVehiclePage />} />
      <Route path="/edit-vehicle/:id" element={<AddVehiclePage />} />
      <Route path="/vehicles" element={<VehiclesPage />} />
      <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
      <Route path="/book/:id" element={<BookingPage />} />
      <Route path="/pay/booking/:bookingId" element={<BookingPaymentPage />} />
      <Route path="/listings" element={<ListingsPage />} />
      <Route path="/messages" element={<ChatPage />} />
      <Route path="/apply-owner" element={<OwnerApplicationPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="users/:id" element={<AdminUserDetailsPage />} />
        <Route path="verification" element={<AdminVerificationPage />} />
        <Route path="car-verification" element={<AdminCarVerificationPage />} />
        <Route path="cars" element={<AdminCarsPage />} />
        <Route path="rentals" element={<AdminRentalsPage />} />
        <Route path="payments" element={<AdminPaymentsPage />} />
        <Route path="mechanics" element={<AdminMechanicsPage />} />
        <Route path="messages" element={<ChatPage isNested={true} />} />
      </Route>
      <Route path="/seller" element={<SellerLayout />}>
        <Route path="dashboard" element={<SellerDashboardPage />} />
        <Route path="fleet" element={<SellerFleetPage />} />
        <Route path="bookings" element={<SellerBookingsPage />} />
        <Route path="maintenance" element={<SellerMechanicRequestsPage />} />
        <Route path="messages" element={<ChatPage isNested={true} />} />
        <Route path="add-vehicle" element={<AddVehiclePage />} />
        <Route path="edit-vehicle/:id" element={<AddVehiclePage />} />
      </Route>
      <Route path="/request-mechanic" element={<RequestMechanicPage />} />
      <Route path="/mechanic/dashboard" element={<MechanicDashboardPage />} />
      <Route path="/mechanic/my-requests" element={<MyMechanicRequestsPage />} />
      <Route path="/mechanic-requests/:id" element={<MechanicRequestDetailPage />} />
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/failure" element={<PaymentFailurePage />} />
    </Routes>
  );
}

export default App;
