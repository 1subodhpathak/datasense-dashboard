import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProfileHero from "@/components/profile/ProfileHero";
import { Badge } from "@/components/ui/badge";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("personal");
  const form = useForm({
    defaultValues: {
      username: "elara",
      displayName: "Elara Voss",
      email: "elara.voss@example.com",
      location: "San Francisco, CA",
      bio: "Data scientist passionate about SQL and data visualization. Always learning and sharing knowledge with the community.",
    },
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <ProfileHero />

        <div className="mx-auto w-full max-w-5xl space-y-10">
          <div>
            <Tabs defaultValue="personal" className="w-full" onValueChange={handleTabChange}>
              <TabsList className="mb-8 inline-flex rounded-full bg-slate-100 p-1 dark:bg-slate-800">
                {[
                  { value: "personal", label: "Personal Info" },
                  { value: "account", label: "Account Settings" },
                  { value: "privacy", label: "Privacy & Security" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-full px-6 py-2 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:text-slate-300 dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Profile Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Display Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-white dark:bg-slate-950" />
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
                                  <Input {...field} className="bg-white dark:bg-slate-950" />
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
                                <Input {...field} type="email" className="bg-white dark:bg-slate-950" />
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
                                <Input {...field} className="bg-white dark:bg-slate-950" />
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
                                  className="h-28 w-full rounded-md border border-input bg-white px-3 py-2 text-base text-slate-700 ring-offset-background placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 dark:bg-slate-950 dark:text-slate-200"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-end border-t border-slate-200 bg-slate-50 py-4 dark:border-slate-700 dark:bg-slate-900/40">
                    <Button className="rounded-full px-6">Save Changes</Button>
                  </CardFooter>
                </Card>

                <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Export Profile Data
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="rounded-full px-5 text-sm">
                          Request Export
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Request Data Export</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          We will email a link to download your data within 24 hours. Make sure your email address is correct.
                        </p>
                        <div className="mt-4 flex justify-end">
                          <Button>Confirm</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Account Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Change Password</h3>
                      <div className="space-y-3">
                        <Input type="password" placeholder="Current Password" className="bg-white dark:bg-slate-950" />
                        <Input type="password" placeholder="New Password" className="bg-white dark:bg-slate-950" />
                        <Input type="password" placeholder="Confirm New Password" className="bg-white dark:bg-slate-950" />
                      </div>
                      <Button className="rounded-full px-5">Update Password</Button>
                    </div>

                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Connected Accounts</h3>
                      {[{ name: "GitHub", status: "Not connected", action: "Connect" }, { name: "Discord", status: "Connected as ElasticVoss#1234", action: "Disconnect" }].map((account) => (
                        <div
                          key={account.name}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900/50"
                        >
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">{account.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{account.status}</p>
                          </div>
                          <Button variant="outline" size="sm" className="rounded-full px-4">
                            {account.action}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card className="border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Privacy & Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Privacy Settings</h3>
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900/50">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Profile Visibility</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Control who can view your profile</p>
                          </div>
                          <select className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                            <option>Public</option>
                            <option>Friends only</option>
                            <option>Private</option>
                          </select>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900/50">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Activity Status</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Show when you're online</p>
                          </div>
                          <label className="relative inline-flex cursor-pointer items-center">
                            <input type="checkbox" className="peer sr-only" defaultChecked />
                            <div className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus:outline-none">
                              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">Session Management</h3>
                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900/50">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Current Session</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">San Francisco, CA • Chrome on macOS</p>
                          </div>
                          <Badge className="rounded-full bg-emerald-500 px-3 py-1 text-xs text-emerald-950">Active Now</Badge>
                        </div>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Started May 1, 2025 at 10:24 AM</p>
                      </div>

                      <div className="rounded-xl bg-white p-3 shadow-sm dark:bg-slate-900/50">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-800 dark:text-slate-200">Active Session</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">New York, NY • Mobile App</p>
                          </div>
                          <Badge className="rounded-full bg-slate-200 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            3 days ago
                          </Badge>
                        </div>
                        <Button size="sm" variant="destructive" className="mt-2 rounded-full px-4">
                          Log Out
                        </Button>
                      </div>

                      <div className="flex justify-end">
                        <Button variant="destructive" className="rounded-full px-5">
                          Log Out of All Devices
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
