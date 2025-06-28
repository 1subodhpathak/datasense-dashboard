import React, { useState, useEffect } from "react";
import { createAvatar } from "@dicebear/core";
import * as avataaars from "@dicebear/avataaars";
import * as bottts from "@dicebear/bottts";
import * as identicon from "@dicebear/identicon";
import * as pixelArt from "@dicebear/pixel-art";
import * as lorelei from "@dicebear/lorelei";
import * as adventurer from "@dicebear/adventurer";
import { X } from "lucide-react";

const diceBearStyles = [
    { name: "avataaars", lib: avataaars },
    { name: "bottts", lib: bottts },
    { name: "identicon", lib: identicon },
    { name: "pixel-art", lib: pixelArt },
    { name: "lorelei", lib: lorelei },
    { name: "adventurer", lib: adventurer },
];

interface AvatarData {
    seed: string;
    dataUrl: string;
}

interface AdvancedAvatarSelectorProps {
    onAvatarSelect: (avatarDataUrl: string) => void;
    onClose: () => void;
}

function generateRandomSeed() {
    return Math.random().toString(36).substring(7);
}

export const AdvancedAvatarSelector: React.FC<AdvancedAvatarSelectorProps> = ({ onAvatarSelect, onClose }) => {
    const [selectedStyle, setSelectedStyle] = useState<string>("avataaars");
    const [generatedAvatars, setGeneratedAvatars] = useState<Record<string, AvatarData[]>>({});
    const [showGallery, setShowGallery] = useState(false);

    useEffect(() => {
        // Generate avatars for all styles on mount
        const avatars: Record<string, AvatarData[]> = {};
        diceBearStyles.forEach((style) => {
            avatars[style.name] = Array(5)
                .fill(null)
                .map(() => {
                    const seed = generateRandomSeed();
                    const avatar = createAvatar(style.lib, {
                        seed,
                        size: 128,
                        backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
                    });
                    return {
                        seed,
                        dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`,
                    };
                });
        });
        setGeneratedAvatars(avatars);
    }, []);

    const handleRegenerate = () => {
        const style = diceBearStyles.find((s) => s.name === selectedStyle);
        if (!style) return;
        const seed = generateRandomSeed();
        const avatar = createAvatar(style.lib, {
            seed,
            size: 128,
            backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
        });
        setGeneratedAvatars((prev) => ({
            ...prev,
            [selectedStyle]: [
                {
                    seed,
                    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`,
                },
                ...(prev[selectedStyle] || []),
            ].slice(0, 5),
        }));
    };

    const handleGenerateMore = (styleName: string) => {
        const style = diceBearStyles.find((s) => s.name === styleName);
        if (!style) return;
        const newAvatars = Array(5)
            .fill(null)
            .map(() => {
                const seed = generateRandomSeed();
                const avatar = createAvatar(style.lib, {
                    seed,
                    size: 128,
                    backgroundColor: ["b6e3f4", "c0aede", "d1d4f9", "ffd5dc", "ffdfbf"],
                });
                return {
                    seed,
                    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(avatar.toString())}`,
                };
            });
        setGeneratedAvatars((prev) => ({
            ...prev,
            [styleName]: [...(prev[styleName] || []), ...newAvatars],
        }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-80 flex items-center justify-center p-4 transition-all duration-300">
            <div className="bg-zinc-900 rounded-2xl max-w-2xl w-full p-8 border border-zinc-700 shadow-2xl relative">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="text-2xl font-bold text-white">Choose Avatar Style</h3>
                        <p className="text-zinc-400 text-sm mt-1">Pick a style and generate your unique look!</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors text-2xl">
                        <X className="h-7 w-7" />
                    </button>
                </div>
                {!showGallery ? (
                    <>
                        <div className="grid grid-cols-3 gap-6 mb-8">
                            {diceBearStyles.map((style) => (
                                <button
                                    key={style.name}
                                    onClick={() => setSelectedStyle(style.name)}
                                    className={`group p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400
                                    ${selectedStyle === style.name ? "border-teal-400 bg-zinc-800 scale-105 shadow-lg" : "border-zinc-700 bg-zinc-900 hover:border-teal-500 hover:scale-105"}`}
                                >
                                    <div className="aspect-square w-24 h-24 flex items-center justify-center mb-2">
                                        {generatedAvatars[style.name] && generatedAvatars[style.name][0] ? (
                                            <img
                                                src={generatedAvatars[style.name][0].dataUrl || "/placeholder.svg"}
                                                alt={style.name}
                                                className="w-full h-full object-contain rounded-lg shadow-md"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-lg">
                                                <p className="text-zinc-400">Loading...</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className={`text-center mt-1 text-base font-semibold capitalize ${selectedStyle === style.name ? "text-teal-300" : "text-white group-hover:text-teal-200"}`}>{style.name}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => {
                                    if (generatedAvatars[selectedStyle] && generatedAvatars[selectedStyle][0]) {
                                        onAvatarSelect(generatedAvatars[selectedStyle][0].dataUrl);
                                    }
                                }}
                                className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition-all text-lg"
                            >
                                Use This Avatar
                            </button>
                            <button
                                onClick={handleRegenerate}
                                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-teal-300 rounded-lg font-medium transition-all"
                            >
                                Regenerate Avatar
                            </button>
                            <button
                                onClick={() => setShowGallery(true)}
                                className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-all"
                            >
                                Gallery
                            </button>
                        </div>
                    </>
                ) : (
                    <div>
                        {diceBearStyles.map((style) => (
                            <div key={style.name} className="mb-8">
                                <h4 className="text-lg font-semibold capitalize text-white mb-3">{style.name}</h4>
                                <div className="grid grid-cols-5 gap-4">
                                    {generatedAvatars[style.name]?.map((avatar, index) => (
                                        <button
                                            key={index}
                                            onClick={() => onAvatarSelect(avatar.dataUrl)}
                                            className="border border-zinc-700 rounded-lg p-2 hover:bg-zinc-800 hover:border-teal-400 transition-colors shadow-sm"
                                        >
                                            <img
                                                src={avatar.dataUrl || "/placeholder.svg"}
                                                alt={`${style.name} ${index + 1}`}
                                                className="w-full aspect-square object-contain rounded-md"
                                            />
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <button
                                        onClick={() => handleGenerateMore(style.name)}
                                        className="text-sm text-teal-400 hover:underline"
                                    >
                                        Generate 5 more options
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowGallery(false)}
                            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg font-medium transition-all mt-4"
                        >
                            Back to Styles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedAvatarSelector; 