import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { StoreContext } from "@/contexts/StoreContext";
import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/supabase";
import { Bell, Send, Users, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";

export const NotificationDebugger = () => {
    const { user } = useAuth();
    const theStore = useContext(StoreContext);
    const [testTitle, setTestTitle] = useState("Test Notification");
    const [testMessage, setTestMessage] = useState("This is a test notification from SheBalance!");
    const [isSending, setIsSending] = useState(false);
    const [copiedToken, setCopiedToken] = useState(false);

    // Get current user's FCM tokens
    const { data: userTokens, refetch: refetchUserTokens } = useQuery({
        queryKey: ["user-fcm-tokens", user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            const { data, error } = await supabase
                .from("devices_token")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        },
        enabled: !!user?.id,
    });

    // Get all store tokens
    const { data: storeTokens } = useQuery({
        queryKey: ["store-fcm-tokens", theStore?.id],
        queryFn: async () => {
            if (!theStore?.id) return [];

            // Get store owner and sales reps
            const { data: store } = await supabase
                .from("stores")
                .select("owner_id")
                .eq("id", theStore.id)
                .single();

            const { data: salesReps } = await supabase
                .from("store_sales_reps")
                .select("email")
                .eq("store_id", theStore.id);

            let userIds = [store?.owner_id].filter(Boolean);

            if (salesReps && salesReps.length > 0) {
                const { data: users } = await supabase
                    .from("users")
                    .select("id")
                    .in("email", salesReps.map(r => r.email));

                if (users) {
                    userIds = [...userIds, ...users.map(u => u.id)];
                }
            }

            const { data: tokens, error } = await supabase
                .from("devices_token")
                .select("id, user_id, token, created_at, users(email)")
                .in("user_id", userIds);

            if (error) throw error;
            return tokens || [];
        },
        enabled: !!theStore?.id,
    });

    const sendTestToSelf = async () => {
        if (!user?.id) {
            toast.error("User not authenticated");
            return;
        }

        setIsSending(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/notifications/send-to-user`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    title: testTitle,
                    body: testMessage,
                    data: {
                        link: "/dashboard",
                        url: "/dashboard",
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            console.log("Test notification result:", result);
            toast.success("Test notification sent! Check your notifications.");
            refetchUserTokens();
        } catch (error: any) {
            console.error("Failed to send test notification:", error);
            toast.error(`Failed to send: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const sendTestToStore = async () => {
        if (!theStore?.id) {
            toast.error("No store selected");
            return;
        }

        setIsSending(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${apiUrl}/api/notifications/send-to-store`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    storeId: theStore.id,
                    title: testTitle,
                    body: testMessage,
                    data: {
                        link: "/dashboard",
                        url: "/dashboard",
                    },
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            const result = await response.json();
            console.log("Store notification result:", result);
            toast.success(`Notification sent to all store users!`);
        } catch (error: any) {
            console.error("Failed to send store notification:", error);
            toast.error(`Failed to send: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };

    const copyToken = (token: string) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(true);
        toast.success("Token copied to clipboard!");
        setTimeout(() => setCopiedToken(false), 2000);
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center gap-2">
                <Bell className="h-6 w-6" />
                <h2 className="text-2xl font-bold">Push Notification Debugger</h2>
            </div>

            {/* Test Notification Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Send Test Notification</CardTitle>
                    <CardDescription>
                        Test push notifications to yourself or all store users
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={testTitle}
                            onChange={(e) => setTestTitle(e.target.value)}
                            placeholder="Notification title"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={testMessage}
                            onChange={(e) => setTestMessage(e.target.value)}
                            placeholder="Notification message"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={sendTestToSelf}
                            disabled={isSending || !testTitle || !testMessage}
                            className="flex-1"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Send to Myself
                        </Button>
                        <Button
                            onClick={sendTestToStore}
                            disabled={isSending || !testTitle || !testMessage || !theStore?.id}
                            variant="secondary"
                            className="flex-1"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Send to Store
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Your Devices */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Registered Devices</CardTitle>
                    <CardDescription>
                        FCM tokens registered for your account ({userTokens?.length || 0} device{userTokens?.length !== 1 ? 's' : ''})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!userTokens || userTokens.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No devices registered</p>
                    ) : (
                        <div className="space-y-3">
                            {userTokens.map((device, idx) => (
                                <div key={device.id} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Device {idx + 1}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <code className="text-xs bg-muted p-2 rounded flex-1 overflow-x-auto">
                                            {device.token.substring(0, 40)}...
                                        </code>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => copyToken(device.token)}
                                        >
                                            {copiedToken ? (
                                                <Check className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <Copy className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Registered: {new Date(device.created_at).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Store Devices */}
            {theStore && (
                <Card>
                    <CardHeader>
                        <CardTitle>Store Devices</CardTitle>
                        <CardDescription>
                            All registered devices for {theStore.store_name} ({storeTokens?.length || 0} device{storeTokens?.length !== 1 ? 's' : ''})
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!storeTokens || storeTokens.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No devices registered for this store</p>
                        ) : (
                            <div className="space-y-3">
                                {storeTokens.map((device, idx) => (
                                    <div key={device.id} className="p-3 border rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                                {(device.users as any)?.email || "Unknown user"}
                                            </span>
                                        </div>
                                        <code className="text-xs bg-muted p-2 rounded block overflow-x-auto">
                                            {device.token.substring(0, 40)}...
                                        </code>
                                        <p className="text-xs text-muted-foreground">
                                            Registered: {new Date(device.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <CardTitle>How to Use</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Make sure you have granted notification permissions in your browser</li>
                        <li>Verify that your device is listed in "Your Registered Devices" above</li>
                        <li>Enter a test title and message</li>
                        <li>Click "Send to Myself" to test notifications to your devices only</li>
                        <li>Click "Send to Store" to send to all users in the current store</li>
                        <li>Check the browser console for detailed logs about notification delivery</li>
                        <li>Check the server logs to see recipient information</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
};
