/**
 * Push Notification Diagnostic Tool
 * 
 * Open browser console and run: checkNotificationStatus()
 * This will show you exactly what's wrong with notifications
 */

window.checkNotificationStatus = async function () {
    console.log("=".repeat(60));
    console.log("🔍 PUSH NOTIFICATION DIAGNOSTIC");
    console.log("=".repeat(60));

    // 1. Check browser support
    console.log("\n1️⃣ Browser Support:");
    console.log("  - Notification API:", "Notification" in window ? "✅ Supported" : "❌ Not supported");
    console.log("  - Service Worker:", "serviceWorker" in navigator ? "✅ Supported" : "❌ Not supported");
    console.log("  - Push API:", "PushManager" in window ? "✅ Supported" : "❌ Not supported");

    // 2. Check notification permission
    console.log("\n2️⃣ Notification Permission:");
    console.log("  - Status:", Notification.permission);
    if (Notification.permission === "denied") {
        console.log("  ❌ PROBLEM: Notifications are BLOCKED in browser settings");
        console.log("  💡 FIX: Go to browser settings and allow notifications for this site");
    } else if (Notification.permission === "granted") {
        console.log("  ✅ Permission granted");
    } else {
        console.log("  ⚠️  Permission not requested yet");
    }

    // 3. Check service worker
    console.log("\n3️⃣ Service Worker:");
    if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            console.log("  ✅ Service worker registered");
            console.log("  - Scope:", registration.scope);
            console.log("  - Active:", registration.active ? "✅ Yes" : "❌ No");
        } else {
            console.log("  ❌ PROBLEM: No service worker registered");
            console.log("  💡 FIX: Refresh the page");
        }
    }

    // 4. Check FCM token
    console.log("\n4️⃣ FCM Token:");
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            import.meta.env.VITE_SUPABASE_PROJECT_URL,
            import.meta.env.VITE_SUPABASE_API_KEY
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: tokens } = await supabase
                .from('devices_token')
                .select('*')
                .eq('user_id', user.id);

            if (tokens && tokens.length > 0) {
                console.log(`  ✅ ${tokens.length} token(s) registered for user`);
                tokens.forEach((t, i) => {
                    console.log(`  Token ${i + 1}:`, t.token.substring(0, 50) + "...");
                });
            } else {
                console.log("  ❌ PROBLEM: No FCM token in database");
                console.log("  💡 FIX: Refresh the page to register token");
            }
        } else {
            console.log("  ⚠️  Not logged in");
        }
    } catch (error) {
        console.log("  ❌ Error checking token:", error.message);
    }

    // 5. Test notification
    console.log("\n5️⃣ Test Notification:");
    if (Notification.permission === "granted") {
        try {
            new Notification("Test Notification", {
                body: "If you see this, browser notifications work!",
                icon: "/Shebalance_icon.png"
            });
            console.log("  ✅ Test notification sent");
            console.log("  👀 Check if you saw a notification appear");
        } catch (error) {
            console.log("  ❌ Failed to show notification:", error.message);
        }
    } else {
        console.log("  ⏭️  Skipped (permission not granted)");
    }

    console.log("\n" + "=".repeat(60));
    console.log("📋 SUMMARY:");
    console.log("=".repeat(60));

    if (Notification.permission === "denied") {
        console.log("❌ Main Issue: Notifications are BLOCKED");
        console.log("💡 Solution: Enable notifications in browser settings");
    } else if (Notification.permission === "default") {
        console.log("⚠️  Main Issue: Permission not requested");
        console.log("💡 Solution: Refresh the page");
    } else {
        console.log("✅ Everything looks good!");
        console.log("If you're still not receiving notifications:");
        console.log("1. Check if FCM token is registered (see section 4)");
        console.log("2. Check browser console for errors");
        console.log("3. Try clearing site data and logging in again");
    }
    console.log("=".repeat(60));
};

console.log("💡 Diagnostic tool loaded! Run: checkNotificationStatus()");
