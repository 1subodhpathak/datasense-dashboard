import React, { useState } from "react";

const defaultAvatars = [
    "/avatars/avatar1.png",
    "/avatars/avatar2.png",
    "/avatars/avatar3.png",
    "/avatars/avatar4.png",
    "/avatars/avatar5.png",
    "/avatars/avatar6.png",
];

interface AvatarSelectorProps {
    currentAvatar: string;
    onAvatarSelect: (avatar: string) => void;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({ currentAvatar, onAvatarSelect }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full text-sm transition duration-150 ease-in-out"
            >
                Choose Avatar
            </button>
            {isOpen && (
                <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-xl z-10">
                    <div className="p-4 grid grid-cols-3 gap-4">
                        {defaultAvatars.map((avatar, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onAvatarSelect(avatar);
                                    setIsOpen(false);
                                }}
                                className={`w-full aspect-square rounded-full overflow-hidden border-2 ${currentAvatar === avatar ? "border-blue-600" : "border-transparent"
                                    } hover:border-blue-400 transition duration-150 ease-in-out`}
                            >
                                <img
                                    src={avatar || "/placeholder.svg"}
                                    alt={`Avatar ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvatarSelector; 