import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileContext } from "@/context/ProfileContext";
import { Trash2, Camera, Save, Loader2, X, AlertCircle, Check, Grid } from "lucide-react";
import * as avataaars from "@dicebear/avataaars";
import * as bottts from "@dicebear/bottts";
import * as identicon from "@dicebear/identicon";
import * as pixelArt from "@dicebear/pixel-art";
import * as lorelei from "@dicebear/lorelei";
import * as adventurer from "@dicebear/adventurer";
import { createAvatar } from "@dicebear/core";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft } from "lucide-react";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
const DEFAULT_BANNER = "/placeholder.svg?height=400&width=1200";
const API_ENDPOINT = "https://server.datasenseai.com/battleground-profile";

// DiceBear styles mapping
const diceBearStyles = [
    { name: "avataaars", lib: avataaars },
    { name: "bottts", lib: bottts },
    { name: "identicon", lib: identicon },
    { name: "pixel-art", lib: pixelArt },
    { name: "lorelei", lib: lorelei },
    { name: "adventurer", lib: adventurer },
];

interface ProfileData {
    avatar?: string;
    banner?: string;
    firstname: string;
    lastname: string;
    email?: string;
    mobile?: string;
    profession?: string;
    company?: string;
    showPhone?: boolean;
}

interface AvatarData {
    seed: string;
    dataUrl: string;
}

// Get clerkId from context, localStorage, or props - replace with your auth solution

// Mock ProfileContext for demo
const MockProfileContext = {
    profile: null,
    setProfile: (profile: ProfileData) => {
        console.log("Profile updated:", profile);
    }
};

const ProfileEdit: React.FC = () => {
    // Use mock context for demo - replace with actual context
    const { profile: contextProfile, setProfile: setContextProfile } = MockProfileContext;
    const navigate = useNavigate();
    const { user } = useUser();
    
    // Profile data state
    const [avatar, setAvatar] = useState<string>(DEFAULT_AVATAR);
    const [banner, setBanner] = useState<string>(DEFAULT_BANNER);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [profession, setProfession] = useState("");
    const [company, setCompany] = useState("");
    const [showPhone, setShowPhone] = useState(false);
    
    // UI states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showAllAvatarsModal, setShowAllAvatarsModal] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState("avataaars");
    
    // Verification states
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [showVerificationInput, setShowVerificationInput] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verifyingPhone, setVerifyingPhone] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);
    
    // Media file states
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    
    // Avatar generation states
    const [avatarSeeds, setAvatarSeeds] = useState<Record<string, string>>({});
    const [generatedAvatars, setGeneratedAvatars] = useState<Record<string, AvatarData[]>>({});
    
    // Image cropping states
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState({ unit: "%", width: 90, height: 90, x: 5, y: 5 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);
    const [isCroppingAvatar, setIsCroppingAvatar] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Original profile data for comparison
    const [originalProfile, setOriginalProfile] = useState<ProfileData | null>(null);

    // Generate random seed for avatars
    const generateRandomSeed = () => Math.random().toString(36).substring(7);

    // Fetch profile data from API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const clerkId = user?.id;
            const response = await fetch(`${API_ENDPOINT}/${clerkId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const profileData = await response.json();
                
                // Map API response to component state
                setAvatar(profileData.avatar || DEFAULT_AVATAR);
                setBanner(profileData.banner || DEFAULT_BANNER);
                setFirstName(profileData.firstname || "");
                setLastName(profileData.lastname || "");
                setEmail(profileData.email || "");
                setPhone(profileData.mobile || "");
                setProfession(profileData.profession || "");
                setCompany(profileData.company || "");
                setShowPhone(profileData.showPhone || false);
                
                // Store original profile for comparison
                setOriginalProfile(profileData);
                
                // Update context if available
                if (setContextProfile) {
                    setContextProfile(profileData);
                }
            } else if (response.status === 404) {
                // Profile doesn't exist - use fallback/default values
                console.log("Profile not found, using default values");
                setOriginalProfile(null);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError("Failed to load profile data. Using default values.");
            setOriginalProfile(null);
        } finally {
            setLoading(false);
        }
    };

    // Initialize avatar seeds for each style
    useEffect(() => {
        const seeds: Record<string, string> = {};
        const avatars: Record<string, AvatarData[]> = {};

        diceBearStyles.forEach((style) => {
            seeds[style.name] = generateRandomSeed();

            // Generate 5 mock avatars for each style
            avatars[style.name] = Array(5)
                .fill(null)
                .map(() => {
                    const seed = generateRandomSeed();
                    const mockAvatar = `https://api.dicebear.com/7.x/${style.name}/svg?seed=${seed}`;
                    return {
                        seed,
                        dataUrl: mockAvatar,
                    };
                });
        });

        setAvatarSeeds(seeds);
        setGeneratedAvatars(avatars);
    }, []);

    // Fetch profile on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const isFormValid = email.trim() !== "" && /.+@.+\..+/.test(email);
    const isChanged = originalProfile ? (
        avatar !== (originalProfile.avatar || DEFAULT_AVATAR) || 
        banner !== (originalProfile.banner || DEFAULT_BANNER) ||
        firstName !== (originalProfile.firstname || "") || 
        lastName !== (originalProfile.lastname || "") || 
        email !== (originalProfile.email || "") || 
        phone !== (originalProfile.mobile || "") || 
        profession !== (originalProfile.profession || "") || 
        company !== (originalProfile.company || "") || 
        showPhone !== (originalProfile.showPhone || false)
    ) : (
        firstName.trim() !== "" || 
        lastName.trim() !== "" || 
        email.trim() !== "" || 
        phone.trim() !== "" || 
        profession.trim() !== "" || 
        company.trim() !== ""
    );

    // Handle file upload for avatar
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match("image.*")) {
                setError("Please select an image file");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setError("Image size should be less than 2MB");
                return;
            }

            setAvatarFile(file);
            const previewUrl = URL.createObjectURL(file);
            setCropImage(previewUrl);
            setIsCroppingAvatar(true);
            setShowCropModal(true);
        }
    };

    // Handle file upload for banner
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match("image.*")) {
                setError("Please select an image file");
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }

            setBannerFile(file);
            const previewUrl = URL.createObjectURL(file);
            setCropImage(previewUrl);
            setIsCroppingAvatar(false);
            setShowCropModal(true);
        }
    };

    // Reset avatar to default
    const handleDeleteAvatar = () => {
        // Clean up blob URL if it exists
        if (avatarPreview && avatarPreview.startsWith('blob:')) {
            URL.revokeObjectURL(avatarPreview);
        }
        if (avatar && avatar.startsWith('blob:')) {
            URL.revokeObjectURL(avatar);
        }
        
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatar(DEFAULT_AVATAR);
    };

    // Reset banner to default
    const handleDeleteBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
        setBanner(DEFAULT_BANNER);
    };

    // Generate DiceBear avatar
    const handleGenerateDiceBearAvatar = async (styleName: string) => {
    try {
        const seed = generateRandomSeed();
        const mockAvatar = `https://api.dicebear.com/7.x/${styleName}/svg?seed=${seed}`;
        
        // Convert SVG URL to file
        const avatarFile = await convertSvgToFile(mockAvatar, `${styleName}-${seed}.svg`);
        setAvatarFile(avatarFile);
        
        // Set preview with data URL
        const previewUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(previewUrl);
        setAvatar(previewUrl);
        
        setAvatarSeeds((prev) => ({
            ...prev,
            [styleName]: seed,
        }));
    } catch (error) {
        setError('Failed to generate avatar. Please try again.');
    }
};

    // Select DiceBear avatar style
    const handleSelectDiceBearAvatar = async (styleName: string) => {
        try {
            setSelectedStyle(styleName);
            const mockAvatar = `https://api.dicebear.com/7.x/${styleName}/svg?seed=${generateRandomSeed()}`;
            
            // Convert SVG URL to file
            const avatarFile = await convertSvgToFile(mockAvatar, `${styleName}-avatar.svg`);
            setAvatarFile(avatarFile);
            
            // Set preview with data URL
            const previewUrl = URL.createObjectURL(avatarFile);
            setAvatarPreview(previewUrl);
            setAvatar(previewUrl);
            
            setShowAvatarModal(false);
        } catch (error) {
            setError('Failed to generate avatar. Please try again.');
        }
    };

    // Select a specific avatar from the gallery
    const handleSelectSpecificAvatar = async (styleName: string, avatarData: AvatarData) => {
    try {
        setSelectedStyle(styleName);
        
        // Convert SVG URL to file
        const avatarFile = await convertSvgToFile(avatarData.dataUrl, `${styleName}-${avatarData.seed}.svg`);
        setAvatarFile(avatarFile);
        
        // Set preview with data URL
        const previewUrl = URL.createObjectURL(avatarFile);
        setAvatarPreview(previewUrl);
        setAvatar(previewUrl);
        
        setShowAllAvatarsModal(false);
        setShowAvatarModal(false);
    } catch (error) {
        setError('Failed to select avatar. Please try again.');
    }
};

    // Handle regenerating avatar with same style but different seed
    const handleRegenerateAvatar = () => {
        if (selectedStyle) {
            handleGenerateDiceBearAvatar(selectedStyle);
        }
    };

    // Generate more avatars for the gallery
    const handleGenerateMoreAvatars = (styleName: string) => {
        const newAvatars = Array(5)
            .fill(null)
            .map(() => {
                const seed = generateRandomSeed();
                const mockAvatar = `https://api.dicebear.com/7.x/${styleName}/svg?seed=${seed}`;
                return {
                    seed,
                    dataUrl: mockAvatar,
                };
            });

        setGeneratedAvatars((prev) => ({
            ...prev,
            [styleName]: [...(prev[styleName] || []), ...newAvatars],
        }));
    };

    // Send verification code
    const handleSendVerificationCode = async (type: 'email' | 'phone') => {
        if (type === "email" && (!email || email.trim() === "")) {
            setError("Please enter an email address first");
            return;
        }

        if (type === "phone" && (!phone || phone.trim() === "")) {
            setError("Please enter a phone number first");
            return;
        }

        try {
            setVerifyingEmail(type === "email");
            setVerifyingPhone(type === "phone");

            await new Promise((resolve) => setTimeout(resolve, 1000));

            setVerificationSent(true);
            setShowVerificationInput(true);
            setError(null);
        } catch (error) {
            setError(`Failed to send verification code to ${type === "email" ? "email" : "phone"}. Please try again.`);
        } finally {
            setVerifyingEmail(false);
            setVerifyingPhone(false);
        }
    };

    // Verify code
    const handleVerifyCode = async (type: 'email' | 'phone') => {
        if (!verificationCode || verificationCode.trim() === "") {
            setError("Please enter the verification code");
            return;
        }

        try {
            setVerifyingEmail(type === "email");
            setVerifyingPhone(type === "phone");

            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (type === "email") {
                setEmailVerified(true);
            } else {
                setPhoneVerified(true);
            }

            setShowVerificationInput(false);
            setVerificationCode("");
            setError(null);
        } catch (error) {
            setError("Invalid verification code. Please try again.");
        } finally {
            setVerifyingEmail(false);
            setVerifyingPhone(false);
        }
    };

    // Image cropping functions
    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        imgRef.current = e.currentTarget;
        if (isCroppingAvatar) {
            setCrop({ unit: "%", width: 90, height: 90, x: 5, y: 5 });
        } else {
            setCrop({ unit: "%", width: 90, height: 50, x: 5, y: 25 });
        }
    };

    const onCropComplete = (crop: any) => {
        setCompletedCrop(crop);
        makeClientCrop(crop);
    };

    const makeClientCrop = async (crop: any) => {
        if (imgRef.current && crop.width && crop.height) {
            const croppedImageUrl = cropImage;
            
            if (isCroppingAvatar) {
                setAvatarPreview(croppedImageUrl);
                setAvatar(croppedImageUrl || DEFAULT_AVATAR);
            } else {
                setBannerPreview(croppedImageUrl);
                setBanner(croppedImageUrl || DEFAULT_BANNER);
            }
        }
    };

    const handleApplyCrop = () => {
        setShowCropModal(false);
    };

    const handleCancelCrop = () => {
        setShowCropModal(false);
        setCropImage(null);
        if (isCroppingAvatar) {
            setAvatarFile(null);
        } else {
            setBannerFile(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(null);
        setError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError("First name and last name are required fields");
            setSaving(false);
            return;
        }

        if (email && !isFormValid) {
            setError("Please enter a valid email address");
            setSaving(false);
            return;
        }

        try {
            const clerkId = user?.id;
            const formData = new FormData();
            
            // Map component state to API expected field names
            formData.append('firstname', firstName);
            formData.append('lastname', lastName);
            if (email) formData.append('email', email);
            if (phone) formData.append('mobile', phone);
            if (profession) formData.append('profession', profession);
            if (company) formData.append('company', company);
            formData.append('showPhone', showPhone.toString());

            // Handle file uploads
           if (avatarFile) {
            formData.append('avatar', avatarFile);
        } else if (avatar !== DEFAULT_AVATAR && !avatar.startsWith('blob:')) {
            // Only include URL if it's not a blob URL
            formData.append('avatarUrl', avatar);
        }

            if (bannerFile) {
                formData.append('banner', bannerFile);
            } else if (banner !== DEFAULT_BANNER) {
                formData.append('bannerUrl', banner);
            }

            const response = await fetch(`${API_ENDPOINT}/${clerkId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedProfile = await response.json();
            
            // Update original profile reference
            setOriginalProfile(savedProfile);
            
            // Update context if available
            if (setContextProfile) {
                setContextProfile(savedProfile);
            }

            setSuccess("Profile updated successfully!");
            
            // Clear file states after successful save
            setAvatarFile(null);
            setBannerFile(null);
            setAvatarPreview(null);
            setBannerPreview(null);
            
            setTimeout(() => {
                setSuccess(null);
                navigate();
            }, 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

        // Add this utility function near the top of your component
    const convertSvgToFile = async (svgUrl: string, filename: string = 'avatar.svg'): Promise<File> => {
        try {
            const response = await fetch(svgUrl);
            const svgText = await response.text();
            const blob = new Blob([svgText], { type: 'image/svg+xml' });
            return new File([blob], filename, { type: 'image/svg+xml' });
        } catch (error) {
            console.error('Error converting SVG to file:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto mt-12 p-8 rounded-2xl shadow-2xl border border-gray-700 bg-gray-900">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-white">Loading profile...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto mt-12 p-8 rounded-2xl shadow-2xl border border-gray-700 bg-gray-900">
            {/* Back Arrow */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-6 top-6 bg-gray-800 hover:bg-gray-700 rounded-full p-2 transition-all border border-gray-700"
                aria-label="Go back"
            >
                <ArrowLeft className="h-6 w-6 text-white" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-700/30 rounded-lg flex items-start backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                    <p className="text-red-200">{error}</p>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-900/20 border border-green-700/30 rounded-lg flex items-start backdrop-blur-sm">
                    <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                    <p className="text-green-200">{success}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Banner Section */}
                <div className="relative rounded-lg overflow-hidden bg-gray-800 h-48 mb-8">
                    {banner !== DEFAULT_BANNER || bannerPreview ? (
                        <img
                            src={bannerPreview || banner}
                            alt="Profile Banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <p className="text-gray-400">No banner image</p>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 flex space-x-2">
                        <label
                            htmlFor="banner-upload"
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-all"
                        >
                            <Camera className="h-5 w-5 text-white" />
                            <input
                                id="banner-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="hidden"
                            />
                        </label>

                        <button
                            type="button"
                            onClick={handleDeleteBanner}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded-full cursor-pointer transition-all"
                        >
                            <Trash2 className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative w-32 h-32 mb-2">
                        <img
                            src={avatarPreview || avatar || DEFAULT_AVATAR}
                            alt="Avatar Preview"
                            className="w-full h-full rounded-full object-cover border-4 border-blue-400 shadow-lg bg-gray-800"
                        />
                        
                        <div className="absolute bottom-0 right-0 flex space-x-1">
                            <button
                                type="button"
                                onClick={() => setShowAvatarModal(true)}
                                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-all"
                            >
                                <Grid className="h-4 w-4 text-white" />
                            </button>

                            <label
                                htmlFor="avatar-upload"
                                className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded-full cursor-pointer transition-all"
                            >
                                <Camera className="h-4 w-4 text-white" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={handleDeleteAvatar}
                                className="p-1.5 bg-red-500 hover:bg-red-600 rounded-full cursor-pointer transition-all"
                            >
                                <Trash2 className="h-4 w-4 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-300 mb-1 font-medium">First Name *</label>
                        <Input
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                            placeholder="First Name"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-1 font-medium">Last Name *</label>
                        <Input
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                            className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                            placeholder="Last Name"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="block text-gray-300 mb-1 font-medium">Email Address</label>
                        <div className="flex">
                            <Input
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    setEmailVerified(false);
                                }}
                                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                                placeholder="Email Address"
                                type="email"
                            />
                            {emailVerified ? (
                                <div className="ml-2 flex items-center text-green-400">
                                    <Check className="h-5 w-5" />
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => handleSendVerificationCode("email")}
                                    disabled={verifyingEmail || !email}
                                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    size="sm"
                                >
                                    {verifyingEmail ? "Sending..." : "Verify"}
                                </Button>
                            )}
                        </div>
                        {!emailVerified && email && (
                            <p className="text-xs text-gray-400 mt-1">Please verify your email address</p>
                        )}
                    </div>

                    <div className="relative">
                        <label className="block text-gray-300 mb-1 font-medium">Phone Number</label>
                        <div className="flex">
                            <Input
                                value={phone}
                                onChange={e => {
                                    setPhone(e.target.value);
                                    setPhoneVerified(false);
                                }}
                                className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                                placeholder="Phone Number"
                                type="tel"
                            />
                            {phoneVerified ? (
                                <div className="ml-2 flex items-center text-green-400">
                                    <Check className="h-5 w-5" />
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => handleSendVerificationCode("phone")}
                                    disabled={verifyingPhone || !phone}
                                    className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                                    size="sm"
                                >
                                    {verifyingPhone ? "Sending..." : "Verify"}
                                </Button>
                            )}
                        </div>
                        {!phoneVerified && phone && (
                            <p className="text-xs text-gray-400 mt-1">Please verify your phone number</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-gray-300 mb-1 font-medium">Profession</label>
                    <Input
                        value={profession}
                        onChange={e => setProfession(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                        placeholder="e.g. Software Engineer, Data Scientist"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 mb-1 font-medium">Company / Institution</label>
                    <Input
                        value={company}
                        onChange={e => setCompany(e.target.value)}
                        className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 placeholder:text-gray-400"
                        placeholder="e.g. Google, MIT"
                    />
                </div>

                <div className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={e => setShowPhone(e.target.checked)}
                        className="accent-blue-600 w-4 h-4 rounded focus:ring-blue-500 border-gray-600 bg-gray-800"
                        id="showPhone"
                    />
                    <label htmlFor="showPhone" className="text-gray-400 text-sm">
                        Make my phone number visible to other users
                    </label>
                </div>

                {/* Verification code input */}
                {showVerificationInput && (
                    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-medium text-white mb-4">Verification</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            {verificationSent
                                ? `A verification code has been sent to your ${verifyingEmail ? "email" : "phone"}. Please enter it below:`
                                : "Please enter the verification code:"}
                        </p>
                        <div className="flex">
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter verification code"
                            />
                            <button
                                type="button"
                                onClick={() => handleVerifyCode(verifyingEmail ? "email" : "phone")}
                                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                            >
                                Verify
                            </button>
                        </div>
                    </div>
                )}

                {/* Save button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Save Profile
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Avatar Generator Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Choose Avatar Style</h3>
                            <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-gray-200">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {diceBearStyles.map((style) => (
                                <button
                                    key={style.name}
                                    onClick={() => handleSelectDiceBearAvatar(style.name)}
                                    className={`p-2 rounded-lg border-2 ${
                                        selectedStyle === style.name
                                            ? "border-blue-500 bg-gray-700"
                                            : "border-gray-700 hover:border-gray-600"
                                    }`}
                                >
                                    <div className="aspect-square flex items-center justify-center">
                                        {generatedAvatars[style.name] && generatedAvatars[style.name][0] ? (
                                            <img
                                                src={generatedAvatars[style.name][0].dataUrl || "/placeholder.svg"}
                                                alt={style.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                <p className="text-gray-400">Loading...</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-center mt-2 text-sm font-medium capitalize text-white">{style.name}</p>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={handleRegenerateAvatar}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Regenerate Avatar
                            </button>
                            <button
                                onClick={() => setShowAllAvatarsModal(true)}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
                            >
                                Gallery

                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* All Avatars Gallery Modal */}
            {showAllAvatarsModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg max-w-4xl w-full p-6 border border-gray-700 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">Avatar Gallery - {selectedStyle}</h3>
                            <button onClick={() => setShowAllAvatarsModal(false)} className="text-gray-400 hover:text-gray-200">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mb-6">
                            {generatedAvatars[selectedStyle]?.map((avatarData, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelectSpecificAvatar(selectedStyle, avatarData)}
                                    className="aspect-square p-2 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
                                >
                                    <img
                                        src={avatarData.dataUrl}
                                        alt={`Avatar ${index + 1}`}
                                        className="w-full h-full object-contain rounded"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => handleGenerateMoreAvatars(selectedStyle)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Generate More Avatars
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Crop Modal */}
            {showCropModal && cropImage && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-lg max-w-2xl w-full p-6 border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-white">
                                Crop {isCroppingAvatar ? "Avatar" : "Banner"}
                            </h3>
                            <button onClick={handleCancelCrop} className="text-gray-400 hover:text-gray-200">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={onCropComplete}
                                aspect={isCroppingAvatar ? 1 : 16 / 9}
                                className="max-h-96"
                            >
                                <img
                                    ref={imgRef}
                                    src={cropImage}
                                    onLoad={onImageLoad}
                                    alt="Crop preview"
                                    className="max-h-96 w-full object-contain"
                                />
                            </ReactCrop>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelCrop}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleApplyCrop}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileEdit;