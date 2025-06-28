import React, { useState } from "react";
import AvatarSelector from "./AvatarSelector";

interface AvatarProps {
    avatarUrl: string;
    onAvatarChange: (avatar: string | File) => void;
}

const Avatar: React.FC<AvatarProps> = ({ avatarUrl, onAvatarChange }) => {
    const [previewUrl, setPreviewUrl] = useState<string>(avatarUrl);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                onAvatarChange(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarSelect = (selectedAvatar: string) => {
        setPreviewUrl(selectedAvatar);
        onAvatarChange(selectedAvatar);
    };

    return (
        <div className="relative w-32 h-auto mx-auto mt-4 flex flex-col items-center">
            <AvatarSelector currentAvatar={previewUrl} onAvatarSelect={handleAvatarSelect} />
            <div className="mt-4 w-full">
                <img
                    src={previewUrl || "/placeholder.svg?height=128&width=128"}
                    alt="Avatar"
                    className="w-full h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                <label
                    htmlFor="avatar-upload"
                    className="bg-white rounded-full p-2 cursor-pointer shadow-md hover:bg-gray-100 transition duration-150 ease-in-out"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </label>
            </div>
            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>
    );
};

export default Avatar; 