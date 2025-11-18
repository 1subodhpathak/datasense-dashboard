import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProfileContext, type ProfileData as ContextProfileData, type PortfolioRecord } from "@/context/ProfileContext";
import { Trash2, Camera, Save, Loader2, X, AlertCircle, Check, Grid } from "lucide-react";
import * as avataaars from "@dicebear/avataaars";
import * as bottts from "@dicebear/bottts";
import * as identicon from "@dicebear/identicon";
import * as pixelArt from "@dicebear/pixel-art";
import * as lorelei from "@dicebear/lorelei";
import * as adventurer from "@dicebear/adventurer";
import ReactCrop from "react-image-crop";
import type { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useUser } from "@clerk/clerk-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const DEFAULT_AVATAR = "https://api.dicebear.com/7.x/avataaars/svg?seed=default";
const DEFAULT_BANNER = "/placeholder.svg?height=400&width=1200";
const API_ENDPOINT = "https://server.datasenseai.com/battleground-profile";
// const API_ENDPOINT = "http://localhost:4000/battleground-profile";

// DiceBear styles mapping
const diceBearStyles = [
    { name: "avataaars", lib: avataaars },
    { name: "bottts", lib: bottts },
    { name: "identicon", lib: identicon },
    { name: "pixel-art", lib: pixelArt },
    { name: "lorelei", lib: lorelei },
    { name: "adventurer", lib: adventurer },
];

interface ProfileApiData {
    avatar?: string;
    banner?: string;
    firstname: string;
    lastname: string;
    email?: string;
    mobile?: string;
    profession?: string;
    company?: string;
    showPhone?: boolean;
    bio?: string;
    skills?: unknown[];
    credentials?: unknown[];
    projects?: unknown[];
}

interface AvatarData {
    seed: string;
    dataUrl: string;
}

// Get clerkId from context, localStorage, or props - replace with your auth solution

const normalizeSkillsForContext = (skills?: unknown[]): string[] => {
    if (!Array.isArray(skills)) return [];
    return skills
        .map((skill) => {
            if (typeof skill === "string") {
                const trimmed = skill.trim();
                return trimmed.length > 0 ? trimmed : null;
            }
            if (skill && typeof skill === "object") {
                const record = skill as Record<string, unknown>;
                const candidate =
                    (typeof record.title === "string" && record.title) ||
                    (typeof record.name === "string" && record.name) ||
                    (typeof record.label === "string" && record.label);
                if (candidate) {
                    const trimmedCandidate = candidate.trim();
                    return trimmedCandidate.length > 0 ? trimmedCandidate : null;
                }
            }
            return null;
        })
        .filter((value): value is string => Boolean(value));
};

const normalizeRecordsForContext = (entries?: unknown[]): PortfolioRecord[] => {
    if (!Array.isArray(entries)) return [];
    return entries
        .map((entry) => {
            if (entry && typeof entry === "object") return entry as PortfolioRecord;
            if (typeof entry === "string") {
                const trimmed = entry.trim();
                return trimmed.length > 0 ? ({ title: trimmed } as PortfolioRecord) : null;
            }
            return null;
        })
        .filter((value): value is PortfolioRecord => Boolean(value));
};

const mapToContextProfile = (data: ProfileApiData | null): ContextProfileData | null => {
    if (!data) return null;
    // If avatar/banner is null, empty string, or undefined, use default
    // This ensures deleted images show as default in ProfileHero
    const avatarValue = data.avatar && data.avatar.trim().length > 0 ? data.avatar : DEFAULT_AVATAR;
    const bannerValue = data.banner && data.banner.trim().length > 0 ? data.banner : DEFAULT_BANNER;
    
    return {
        avatar: avatarValue,
        banner: bannerValue,
        firstName: data.firstname || "",
        lastName: data.lastname || "",
        email: data.email || "",
        phone: data.mobile || "",
        profession: data.profession || "",
        company: data.company || "",
        showPhone: Boolean(data.showPhone),
        bio: data.bio || "",
        skills: normalizeSkillsForContext(data.skills),
        credentials: normalizeRecordsForContext(data.credentials),
        projects: normalizeRecordsForContext(data.projects),
    };
};

const ProfileEdit: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ open, onOpenChange }) => {
    const navigate = useNavigate();
    const { setProfile: setContextProfile } = useContext(ProfileContext);
    const { user } = useUser();
    const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
    const [internalOpen, setInternalOpen] = useState(true);
    const dialogOpen = isControlled ? (open as boolean) : internalOpen;
    
    const handleDialogChange = (value: boolean) => {
        if (isControlled && onOpenChange) {
            onOpenChange(value);
        } else {
            setInternalOpen(value);
            if (!value) {
                navigate(-1);
            }
        }
    };
    
    const closeDialog = () => handleDialogChange(false);
    const inputClass =
        "h-11 rounded-xl border border-dsb-neutral3/40 bg-white/90 text-slate-900 placeholder:text-dsb-neutral2 focus:border-dsb-accent focus:ring-0 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/50";
    
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
    const [bio, setBio] = useState("");
    
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
    const [deleteAvatar, setDeleteAvatar] = useState(false);
    const [deleteBanner, setDeleteBanner] = useState(false);
    
    // Avatar generation states
    const [avatarSeeds, setAvatarSeeds] = useState<Record<string, string>>({});
    const [generatedAvatars, setGeneratedAvatars] = useState<Record<string, AvatarData[]>>({});
    
    // Image cropping states
    const [showCropModal, setShowCropModal] = useState(false);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>({ unit: "%", width: 90, height: 90, x: 5, y: 5 });
    const [completedCrop, setCompletedCrop] = useState<any>(null);
    const [isCroppingAvatar, setIsCroppingAvatar] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Original profile data for comparison
    const [originalProfile, setOriginalProfile] = useState<ProfileApiData | null>(null);

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
                const profileData: ProfileApiData = await response.json();
                
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
                setBio(profileData.bio || "");
                
                // Reset deletion flags
                setDeleteAvatar(false);
                setDeleteBanner(false);
                
                // Store original profile for comparison
                setOriginalProfile(profileData);
                
                // Update context if available
                setContextProfile(mapToContextProfile(profileData));
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

    // Fetch profile when dialog opens
    useEffect(() => {
        if (dialogOpen) {
            fetchProfile();
        }
    }, [dialogOpen]);

    const isFormValid = email.trim() !== "" && /.+@.+\..+/.test(email);
    const isChanged = originalProfile ? (
        deleteAvatar ||
        deleteBanner ||
        avatarFile !== null ||
        bannerFile !== null ||
        avatarPreview !== null ||
        bannerPreview !== null ||
        avatar !== (originalProfile.avatar || DEFAULT_AVATAR) || 
        banner !== (originalProfile.banner || DEFAULT_BANNER) ||
        firstName !== (originalProfile.firstname || "") || 
        lastName !== (originalProfile.lastname || "") || 
        email !== (originalProfile.email || "") || 
        phone !== (originalProfile.mobile || "") || 
        profession !== (originalProfile.profession || "") || 
        company !== (originalProfile.company || "") || 
        showPhone !== (originalProfile.showPhone || false) ||
        bio !== (originalProfile.bio || "")
    ) : (
        deleteAvatar ||
        deleteBanner ||
        avatarFile !== null ||
        bannerFile !== null ||
        avatarPreview !== null ||
        bannerPreview !== null ||
        firstName.trim() !== "" || 
        lastName.trim() !== "" || 
        email.trim() !== "" || 
        phone.trim() !== "" || 
        profession.trim() !== "" || 
        company.trim() !== "" ||
        bio.trim() !== ""
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
            setDeleteAvatar(false); // Clear deletion flag when uploading new file
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
            setDeleteBanner(false); // Clear deletion flag when uploading new file
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
        setDeleteAvatar(true);
    };

    // Reset banner to default
    const handleDeleteBanner = () => {
        setBannerFile(null);
        setBannerPreview(null);
        setBanner(DEFAULT_BANNER);
        setDeleteBanner(true);
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
            formData.append('bio', bio.trim());

            // Handle file uploads and deletions
            if (deleteAvatar) {
                formData.append('deleteAvatar', 'true');
            } else if (avatarFile) {
                formData.append('avatar', avatarFile);
            } else if (avatar !== DEFAULT_AVATAR && !avatar.startsWith('blob:')) {
                // Only include URL if it's not a blob URL
                formData.append('avatarUrl', avatar);
            }

            if (deleteBanner) {
                formData.append('deleteBanner', 'true');
            } else if (bannerFile) {
                formData.append('banner', bannerFile);
            } else if (banner !== DEFAULT_BANNER && !banner.startsWith('blob:')) {
                formData.append('bannerUrl', banner);
            }

            const response = await fetch(`${API_ENDPOINT}/${clerkId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const savedProfile: ProfileApiData = await response.json();
            
            // Handle deleted images - if deletion was requested, ensure they're set to null/empty
            if (deleteAvatar) {
                savedProfile.avatar = null;
            }
            if (deleteBanner) {
                savedProfile.banner = null;
            }
            
            // Update local state to reflect deletions
            if (deleteAvatar) {
                setAvatar(DEFAULT_AVATAR);
            }
            if (deleteBanner) {
                setBanner(DEFAULT_BANNER);
            }
            
            // Update original profile reference
            setOriginalProfile(savedProfile);
            setBio(savedProfile.bio || "");
            
            // Update context if available - this will trigger ProfileHero to re-render
            const contextData = mapToContextProfile(savedProfile);
            setContextProfile(contextData);

            setSuccess("Profile updated successfully!");
            
            // Clear file states after successful save
            setAvatarFile(null);
            setBannerFile(null);
            setAvatarPreview(null);
            setBannerPreview(null);
            setDeleteAvatar(false);
            setDeleteBanner(false);
            
            setTimeout(() => {
                setSuccess(null);
                closeDialog();
            }, 1200);
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

    return (
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-5xl overflow-hidden border border-dsb-neutral3/30 bg-white/95 p-0 shadow-2xl dark:border-white/10 dark:bg-[#08090A]">
                {loading ? (
                    <div className="flex min-h-[420px] items-center justify-center gap-3 py-16 text-dsb-neutral2 dark:text-white/70">
                        <Loader2 className="h-5 w-5 animate-spin text-dsb-accent" />
                        Loading profile...
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="flex max-h-[85vh] flex-col">
                        <div className="flex flex-col gap-2 border-b border-dsb-neutral3/30 bg-white/80 px-6 py-5 dark:border-white/10 dark:bg-white/5">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit profile</h2>
                            <p className="text-sm text-dsb-neutral2 dark:text-white/60">
                                Update your public information so the community sees the best version of you.
                            </p>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                            {error && (
                                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/80 p-4 text-sm text-red-600 dark:border-red-400/30 dark:bg-red-500/10 dark:text-red-200">
                                    <AlertCircle className="mt-0.5 h-5 w-5" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {success && (
                                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                    <Check className="mt-0.5 h-5 w-5" />
                                    <p>{success}</p>
                                </div>
                            )}

                            <section className="space-y-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">Cover image</p>
                                    <p className="text-xs text-dsb-neutral2 dark:text-white/60">Use a 1600 × 400px image for best results.</p>
                                </div>
                                <div className="relative overflow-hidden rounded-2xl border border-dsb-neutral3/30 bg-slate-100/60 dark:border-white/10 dark:bg-white/5">
                                    {banner !== DEFAULT_BANNER || bannerPreview ? (
                                        <img src={bannerPreview || banner} alt="Profile banner" className="h-48 w-full object-cover md:h-56 lg:h-64" />
                                    ) : (
                                        <div className="flex h-48 w-full items-center justify-center text-sm text-dsb-neutral2 dark:text-white/50 md:h-56 lg:h-64">
                                            Add a cover image to personalise your profile.
                                        </div>
                                    )}
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent dark:from-black/40" />
                                    <div className="absolute bottom-4 right-4 flex flex-wrap gap-2">
                                        <label
                                            htmlFor="banner-upload"
                                            className="inline-flex items-center gap-2 rounded-lg cursor-pointer border border-dsb-neutral3/40 bg-white/95 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-dsb-accent hover:text-dsb-accent dark:border-white/10 dark:bg-white/10 dark:text-white"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Upload
                                            <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDeleteBanner}
                                            className="rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-4 py-2 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </section>

                            <section className="grid gap-6 rounded-2xl border border-dsb-neutral3/30 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5 md:grid-cols-[auto,1fr]">
                                <div className="relative mx-auto flex flex-col items-center">
                                    <img
                                        src={avatarPreview || avatar || DEFAULT_AVATAR}
                                        alt="Avatar preview"
                                        className="size-28 rounded-2xl border-4 border-white object-cover shadow-xl dark:border-slate-800 md:size-32"
                                    />
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setShowAvatarModal(true)}
                                            className="border-dsb-neutral3/40 bg-white px-4 text-sm font-semibold text-slate-900 hover:border-dsb-accent hover:text-dsb-accent dark:border-white/15 dark:bg-white/10 dark:text-white/70"
                                        >
                                            Avatar styles
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleRegenerateAvatar}
                                            className="border-dsb-neutral3/40 bg-white px-4 text-sm font-semibold text-slate-900 hover:border-dsb-accent hover:text-dsb-accent dark:border-white/15 dark:bg-white/10 dark:text-white/70"
                                        >
                                            Randomise
                                        </Button>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="inline-flex items-center gap-2 rounded-lg border cursor-pointer border-dsb-neutral3/40 bg-dsb-accent px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-dsb-accent/90"
                                        >
                                            <Camera className="h-4 w-4" />
                                            Upload
                                            <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                        </label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleDeleteAvatar}
                                            className="rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-4 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Reset
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm text-dsb-neutral2 dark:text-white/60">
                                    <p>Upload a crisp headshot or pick a generated avatar. Square images work best.</p>
                                    <ul className="space-y-2 text-xs leading-relaxed">
                                        <li>• Max file size 2MB for avatar and 5MB for cover.</li>
                                        <li>• Supported formats: JPG, PNG, SVG.</li>
                                        <li>• Crop tools help you fine-tune framing before saving.</li>
                                    </ul>
                                </div>
                            </section>

                            <section className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">First name *</label>
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="First name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Last name *</label>
                                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Last name" />
                                </div>
                            </section>

                            <section className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Email address</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={email}
                                            onChange={(e) => {
                                                setEmail(e.target.value);
                                                setEmailVerified(false);
                                            }}
                                            className={inputClass}
                                            placeholder="Email address"
                                            type="email"
                                        />
                                        {emailVerified ? (
                                            <div className="flex h-11 items-center rounded-lg bg-emerald-100 px-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                <Check className="mr-1 h-4 w-4" />
                                                Verified
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleSendVerificationCode("email")}
                                                disabled={verifyingEmail || !email}
                                                className="h-11 rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-4 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {verifyingEmail ? "Sending..." : "Verify"}
                                            </Button>
                                        )}
                                    </div>
                                    {!emailVerified && email && (
                                        <p className="text-xs text-dsb-neutral2 dark:text-white/50">We’ll send a code to confirm ownership.</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Phone number</label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={phone}
                                            onChange={(e) => {
                                                setPhone(e.target.value);
                                                setPhoneVerified(false);
                                            }}
                                            className={inputClass}
                                            placeholder="Phone number"
                                            type="tel"
                                        />
                                        {phoneVerified ? (
                                            <div className="flex h-11 items-center rounded-lg bg-emerald-100 px-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                                <Check className="mr-1 h-4 w-4" />
                                                Verified
                                            </div>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleSendVerificationCode("phone")}
                                                disabled={verifyingPhone || !phone}
                                                className="h-11 rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-4 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {verifyingPhone ? "Sending..." : "Verify"}
                                            </Button>
                                        )}
                                    </div>
                                    {!phoneVerified && phone && (
                                        <p className="text-xs text-dsb-neutral2 dark:text-white/50">Keep your number private by toggling visibility below.</p>
                                    )}
                                </div>
                            </section>

                            <section className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Profession</label>
                                    <Input
                                        value={profession}
                                        onChange={(e) => setProfession(e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Product Analyst"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Company / Institution</label>
                                    <Input
                                        value={company}
                                        onChange={(e) => setCompany(e.target.value)}
                                        className={inputClass}
                                        placeholder="e.g. Datasense AI"
                                    />
                                </div>
                            </section>

                            <section className="space-y-2">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Biography</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="min-h-[140px] w-full rounded-xl border border-dsb-neutral3/40 bg-white/90 px-4 py-3 text-base leading-relaxed text-slate-900 focus:border-dsb-accent focus:outline-none focus:ring-0 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                    placeholder="Share a short summary of your strengths, interests, and goals."
                                />
                                <p className="text-xs text-dsb-neutral2 dark:text-white/50">
                                    This appears on your portfolio hero and helps peers understand your focus.
                                </p>
                            </section>

                            <div className="flex items-center gap-3 rounded-2xl border border-dsb-neutral3/30 bg-white/90 p-4 text-sm text-dsb-neutral2 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                                <input
                                    type="checkbox"
                                    checked={showPhone}
                                    onChange={(e) => setShowPhone(e.target.checked)}
                                    id="showPhone"
                                    className="size-4 rounded border border-dsb-neutral3/50 text-dsb-accent focus:ring-dsb-accent dark:border-white/20 dark:bg-transparent"
                                />
                                <label htmlFor="showPhone" className="cursor-pointer">
                                    Make my phone number visible to other users.
                                </label>
                            </div>

                            {showVerificationInput && (
                                <div className="space-y-3 rounded-2xl border border-dsb-neutral3/30 bg-white/90 p-5 text-sm text-dsb-neutral2 dark:border-white/10 dark:bg-white/5 dark:text-white/70">
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-900 dark:text-white">Verify {verifyingEmail ? "email" : "phone"}</h3>
                                        <p className="text-xs text-dsb-neutral2 dark:text-white/60">
                                            {verificationSent
                                                ? `We’ve sent a code to your ${verifyingEmail ? "email" : "phone"}. Enter it below to confirm.`
                                                : "Enter the verification code to complete confirmation."}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            type="text"
                                            value={verificationCode}
                                            onChange={(e) => setVerificationCode(e.target.value)}
                                            className="h-11 flex-1 rounded-xl border border-dsb-neutral3/40 bg-white/90 px-4 text-base text-slate-900 focus:border-dsb-accent focus:outline-none focus:ring-0 dark:border-white/10 dark:bg-white/5 dark:text-white"
                                            placeholder="Enter verification code"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => handleVerifyCode(verifyingEmail ? "email" : "phone")}
                                            className="h-11 bg-dsb-accent px-6 text-sm font-semibold text-black hover:bg-dsb-accent/90"
                                        >
                                            Verify code
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 border-t border-dsb-neutral3/30 bg-white/80 px-6 py-4 dark:border-white/10 dark:bg-white/5 md:flex-row md:items-center md:justify-between">
                            <span className="text-xs text-dsb-neutral2 dark:text-white/60">
                                {isChanged ? "Unsaved changes" : "Profile is up to date"}
                            </span>
                            <div className="flex flex-wrap gap-3 md:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDialog}
                                    className="rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-6 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving || !isChanged}
                                    className="bg-dsb-accent px-6 py-2 text-sm rounded-lg font-semibold text-black hover:bg-dsb-accent/90 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </DialogContent>

            <Dialog open={showAvatarModal} onOpenChange={setShowAvatarModal}>
                <DialogContent className="max-w-2xl border border-dsb-neutral3/30 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#08090A]">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Choose avatar style</h3>
                    </div>
                    <div className="mt-5 grid grid-cols-3 gap-4">
                        {diceBearStyles.map((style) => (
                            <button
                                key={style.name}
                                onClick={() => handleSelectDiceBearAvatar(style.name)}
                                className={`rounded-2xl border-2 p-3 transition ${
                                    selectedStyle === style.name
                                        ? "border-dsb-accent bg-dsb-accent/10"
                                        : "border-dsb-neutral3/30 hover:border-dsb-accent/60 dark:border-white/10"
                                }`}
                            >
                                <div className="aspect-square overflow-hidden rounded-xl bg-white/80 p-4 dark:bg-white/5">
                                    {generatedAvatars[style.name]?.[0] ? (
                                        <img src={generatedAvatars[style.name][0].dataUrl} alt={style.name} className="h-full w-full object-contain" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-dsb-neutral2 dark:text-white/60">
                                            Loading...
                                        </div>
                                    )}
                                </div>
                                <p className="mt-2 text-center text-sm font-semibold capitalize text-slate-900 dark:text-white">
                                    {style.name.replace("-", " ")}
                                </p>
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex flex-col gap-2">
                        <Button onClick={handleRegenerateAvatar} className="bg-dsb-accent px-4 py-2 text-sm font-semibold text-black hover:bg-dsb-accent/90">
                            Regenerate avatar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowAllAvatarsModal(true)}
                            className="border-dsb-neutral3/40 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:border-dsb-accent hover:text-dsb-accent dark:border-white/15 dark:bg-white/10 dark:text-white/70"
                        >
                            Browse gallery
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showAllAvatarsModal} onOpenChange={setShowAllAvatarsModal}>
                <DialogContent className="max-w-4xl border border-dsb-neutral3/30 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#08090A]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Avatar gallery — {selectedStyle}</h3>
                    <div className="mt-5 grid max-h-[60vh] grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
                        {generatedAvatars[selectedStyle]?.map((avatarData, index) => (
                            <button
                                key={`${avatarData.seed}-${index}`}
                                onClick={() => handleSelectSpecificAvatar(selectedStyle, avatarData)}
                                className="aspect-square rounded-2xl border border-dsb-neutral3/30 bg-white/90 p-3 transition hover:border-dsb-accent dark:border-white/10 dark:bg-white/5"
                            >
                                <img src={avatarData.dataUrl} alt={`Avatar ${index + 1}`} className="h-full w-full object-contain" />
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Button onClick={() => handleGenerateMoreAvatars(selectedStyle)} className="bg-dsb-accent px-5 py-2 text-sm font-semibold text-black hover:bg-dsb-accent/90">
                            Generate more avatars
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showCropModal && Boolean(cropImage)} onOpenChange={(open) => (!open ? handleCancelCrop() : setShowCropModal(true))}>
                <DialogContent className="max-w-2xl border border-dsb-neutral3/30 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#08090A]">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        Crop {isCroppingAvatar ? "avatar" : "cover"}
                    </h3>
                    {cropImage && (
                        <div className="mt-6">
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
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelCrop}
                            className="rounded-lg border border-cyan-600 dark:border-cyan-500 bg-transparent px-5 text-sm font-semibold text-cyan-600 dark:text-cyan-500 hover:bg-cyan-600/10 dark:hover:bg-cyan-500/10"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyCrop}
                            className="bg-dsb-accent px-6 py-2 text-sm font-semibold text-black hover:bg-dsb-accent/90"
                        >
                            Apply crop
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default ProfileEdit;