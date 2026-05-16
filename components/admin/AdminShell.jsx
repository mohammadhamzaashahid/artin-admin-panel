"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <AdminSidebar />

      <div className="lg:pl-72">
        <AdminHeader />

        <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}