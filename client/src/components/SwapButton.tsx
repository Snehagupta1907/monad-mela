"use client";

import { ArrowLeftRight } from "lucide-react";

import SwapModal from "./SwapModal";
import { useState } from "react";
export default function SwapButton() {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
        <> <button
                 onClick={() => setIsOpen(true)}
            className="bg-black font-ropa flex items-center gap-2 text-white px-4 py-2 font-medium text-md rounded-lg"
        >
            <ArrowLeftRight className="h-4 w-4" />
            Swap
        </button>
            <SwapModal isOpen={isOpen} onClose={() => setIsOpen(false)} /></>
    );
}
