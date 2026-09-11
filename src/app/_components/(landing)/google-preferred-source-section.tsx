"use client";

import React from "react";
import { GooglePreferredSourceBtn } from "../google-preferred-source-btn";

export default function GooglePreferredSourceSection() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-center">
      <div className="flex items-center min-w-[245px] min-h-[44px] rounded-full overflow-hidden">
        <GooglePreferredSourceBtn />
      </div>
    </div>
  );
}
