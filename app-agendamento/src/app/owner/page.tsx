"use client";

import React from "react";
import { OwnerRoute } from "../../components/auth/ProtectedRoute";
import OwnerView from "../../components/owner/OwnerView";

export default function OwnerPage() {
  return (
    <OwnerRoute>
      <OwnerView />
    </OwnerRoute>
  );
}
