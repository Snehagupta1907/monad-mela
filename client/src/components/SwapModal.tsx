"use client";

import { useState } from "react";
import { X } from "lucide-react";
import SwapPriceFetcher from "./SwapPriceFetcher"; // import your price fetcher
import toast from "react-hot-toast";
import { useChainId } from "wagmi";

interface SwapModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwapModal({ isOpen, onClose }: SwapModalProps) {
    const [priceData, setPriceData] = useState<any>(null);
    const chainId = useChainId();
    console.log(chainId, "chain")
    const handleSwap = () => {
        if (!priceData) {
            toast.error("Please select tokens and enter amount!");
            return;
        }

        toast.success(
            `Swapped ${priceData.sellAmountHuman} ${priceData.sellTokenSymbol} → ${priceData.buyAmountHuman} ${priceData.buyTokenSymbol}`
        );
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg w-96 text-black">
                {/* Header */}
                <div className="flex justify-between items-center mb-4 text-black">
                    <h2 className="text-lg font-semibold text-black">Swap Tokens</h2>
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-black" />
                    </button>
                </div>

                {/* Price Fetcher */}
                <div className="text-black">
                    <SwapPriceFetcher
                        chainId={chainId}
                        onPrice={(data) => {
                            setPriceData({
                                ...data,
                                sellAmountHuman: (Number(data.sellAmount) / 10 ** data.sellTokenDecimals).toFixed(4),
                                buyAmountHuman: (Number(data.buyAmount) / 10 ** data.buyTokenDecimals).toFixed(4),
                            });
                        }}
                    />
                </div>

                {/* Swap button */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSwap}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                        Confirm Swap
                    </button>
                </div>
            </div>
        </div>
    );
}
