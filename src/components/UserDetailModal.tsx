'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useUser } from '@clerk/clerk-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Alert, AlertDescription } from "./ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

// import { HeaderBackground } from './header-background'

interface UserFormData {
  clerkId: string;
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  instituteOrCompany: string;
  city: string;
  state: string;
  dob: string;
}

interface UserFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  instituteOrCompany?: string;
  city?: string;
  state?: string;
  dob?: string;
  general?: string;
}

export function UserDetailModal({ open, onOpenChange, onClose }) {
  const { isLoaded, isSignedIn, user } = useUser()
  const [formData, setFormData] = useState<UserFormData>({
    clerkId: '',
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    instituteOrCompany: '',
    city: '',
    state: '',
    dob: '',
  })
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setFormData(prevData => ({
        ...prevData,
        clerkId: user.id,
        name: user.fullName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      }))
    }
  }, [isLoaded, isSignedIn, user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  const handleCountryCodeChange = (value) => {
    setFormData(prev => ({ ...prev, countryCode: value }))
  }

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    const phoneRegex = /^\d{10,14}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (10-14 digits)";
    }
    
    if (formData.instituteOrCompany.trim().length < 2) {
      newErrors.instituteOrCompany = "Institute/Company name must be at least 2 characters long";
    }
    
    if (formData.city.trim().length < 2) {
      newErrors.city = "City name must be at least 2 characters long";
    }
    
    if (formData.state.trim().length < 2) {
      newErrors.state = "State name must be at least 2 characters long";
    }
    
    const today = new Date();
    const dob = new Date(formData.dob);
    const age = today.getFullYear() - dob.getFullYear();
    if (isNaN(dob.getTime()) || age < 18 || age > 100) {
      newErrors.dob = "Please enter a valid date of birth (must be between 18 and 100 years old)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('https://server.datasenseai.com/user-details/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone
        }),
      });

      const data = await response.json();
      // const data = await response.json();
      console.log('User details save response:', data);

      if (response.ok) {
        localStorage.setItem('userRegistered', 'true');
        setIsSubmitting(false);
        setTimeout(() => {
          onClose(true);
          window.location.reload();
        }, 1500);
      } else {
        setIsSubmitting(false);
        if (response.status === 400 || response.status === 409) {
          setErrors(data.errors || { general: data.message });
        } else {
          setErrors({ general: data.message || 'An unexpected error occurred. Please try again later.' });
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error saving user details:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again later.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-white p-6">
        <DialogHeader className="relative">
          {/* <HeaderBackground /> */}
          <DialogTitle className="text-2xl font-bold text-center text-gray-900 mb-2 relative z-10">
            Unlock Your Full Experience
          </DialogTitle>
          <h4 className="text-center text-gray-600 relative z-10">
            Just a few more details and you're all set to explore!
          </h4>
        </DialogHeader>
        {errors.general && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            {Object.entries({
              name: "Name",
              email: "Email",
              phone: "Phone",
              instituteOrCompany: "Institute/Company",
              city: "City",
              state: "State",
              dob: "Date of Birth"
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium text-gray-700">
                  {label}
                </Label>
                {key === 'phone' && (
                  <div className="flex w-full">
                    <Select value={formData.countryCode} onValueChange={handleCountryCodeChange}>
                      <SelectTrigger className="w-[100px] rounded-l-md border border-gray-300 bg-white">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+91">+91</SelectItem>
                        <SelectItem value="+1">+1</SelectItem>
                        <SelectItem value="+44">+44</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      id={key}
                      name={key}
                      type="tel"
                      value={formData[key]}
                      onChange={handleChange}
                      required
                      className="flex-1 rounded-r-md border border-gray-300 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:border-blue-500 sm:text-sm sm:leading-6"
                      placeholder="10-14 digit number"
                      maxLength={14}
                    />
                  </div>
                )}
                {key !== 'phone' && (
                  <Input
                    id={key}
                    name={key}
                    type={key === 'email' ? 'email' : key === 'dob' ? 'date' : 'text'}
                    value={formData[key]}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border border-gray-300 bg-transparent py-1.5 pl-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:border-blue-500 sm:text-sm sm:leading-6"
                    placeholder={key === 'phone' ? "1234567890" : ""}
                  />
                )}
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-8">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetailModal;