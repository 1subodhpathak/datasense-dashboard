import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ProfileAvatar from "@/components/profile/Avatar";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const form = useForm({
    defaultValues: {
      username: "elara",
      displayName: "Elara Voss",
      email: "elara.voss@example.com",
      location: "San Francisco, CA",
      bio: "Data scientist passionate about SQL and data visualization. Always learning and sharing knowledge with the community."
    }
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-dsb-neutral1">Manage your personal information and account settings</p>
        </div>

        <Tabs defaultValue="personal" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="neo-glass-dark border-dsb-neutral3/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Profile Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-32 h-32 border-2 border-dsb-accent">
                        <AvatarImage src="/lovable-uploads/69d28d83-f8e5-4020-9669-03543f7a31ff.png" />
                        <AvatarFallback>EV</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl font-bold text-white flex items-center gap-2 justify-center">
                        Elara Voss
                      </span>
                      <Badge variant="outline" className="bg-dsb-accent/10 text-dsb-accent mt-2">Level 42</Badge>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <div className="flex items-center">
                          <span className="text-dsb-neutral1">12996</span>
                          <img
                            src="/lovable-uploads/34808141-1583-4b3b-9f53-488c020557c2.png"
                            alt="DataFuel"
                            className="h-4 w-4 ml-1"
                          />
                        </div>
                        <span className="h-1 w-1 bg-dsb-neutral1 rounded-full"></span>
                        <div className="flex items-center">
                          <span className="text-dsb-neutral1">127</span>
                          <img
                            src="/lovable-uploads/babead22-5d2b-47b5-8933-3049feeb4e32.png"
                            alt="Streak"
                            className="h-4 w-4 ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Form {...form}>
                    <form className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                              <textarea
                                className="w-full h-24 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-dsb-neutral3/30 pt-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="neo-glass-dark border-dsb-neutral3/30">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                    </div>
                    <div className="mt-3">
                      <Button>Update Password</Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dsb-neutral3/30">
                    <h3 className="text-lg font-medium text-white mb-2">Connected Accounts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div>
                          <p className="font-medium">GitHub</p>
                          <p className="text-sm text-dsb-neutral1">Not connected</p>
                        </div>
                        <Button variant="outline" size="sm">Connect</Button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div>
                          <p className="font-medium">Discord</p>
                          <p className="text-sm text-dsb-neutral1">Connected as ElasticVoss#1234</p>
                        </div>
                        <Button variant="outline" size="sm">Disconnect</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="neo-glass-dark border-dsb-neutral3/30">
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Privacy Settings</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div>
                          <p className="font-medium">Profile Visibility</p>
                          <p className="text-sm text-dsb-neutral1">Control who can view your profile</p>
                        </div>
                        <select className="bg-background border border-input rounded-md p-2">
                          <option>Public</option>
                          <option>Friends only</option>
                          <option>Private</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div>
                          <p className="font-medium">Activity Status</p>
                          <p className="text-sm text-dsb-neutral1">Show when you're online</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked />
                          <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-dsb-accent peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-dsb-accent"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dsb-neutral3/30">
                    <h3 className="text-lg font-medium text-white mb-2">Session Management</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-dsb-neutral1">San Francisco, CA • Chrome on macOS</p>
                          </div>
                          <Badge className="bg-green-500">Active Now</Badge>
                        </div>
                        <p className="text-xs text-dsb-neutral1">Started May 1, 2025 at 10:24 AM</p>
                      </div>

                      <div className="p-3 bg-black/30 rounded-md border border-dsb-neutral3/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">Active Session</p>
                            <p className="text-sm text-dsb-neutral1">New York, NY • Mobile App</p>
                          </div>
                          <Badge className="bg-dsb-neutral3">3 days ago</Badge>
                        </div>
                        <Button size="sm" variant="destructive" className="mt-1">Log Out</Button>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button variant="destructive">Log Out of All Devices</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
