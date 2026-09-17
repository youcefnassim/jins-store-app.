"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/lib/supabase/AuthContext";

export function ProfileSettings() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ name })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
      
      // We could trigger a context refresh here, but for now a simple reload or state update is okay.
      // window.location.reload(); 
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setPassLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      toast.success("Password updated successfully");
      setPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass-card border-black/10 dark:border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your account details and public name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address (Cannot be changed)</label>
              <Input value={user?.email || ""} disabled className="opacity-50 dark:bg-black/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name</label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name" 
                className="dark:bg-black/20"
              />
            </div>
            <Button type="submit" disabled={loading || name === profile?.name} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-card border-black/10 dark:border-white/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-500" />
            Security
          </CardTitle>
          <CardDescription>
            Change your account password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="text-sm font-medium mb-1 block">New Password</label>
              <Input 
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter new password" 
                className="dark:bg-black/20"
              />
            </div>
            <Button type="submit" disabled={passLoading || !password} variant="destructive" className="w-full sm:w-auto">
              {passLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
