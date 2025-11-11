import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReferrals } from "@/hooks/useReferrals";
import { format } from "date-fns";
import { 
  Copy, 
  Loader2, 
  Users, 
  DollarSign, 
  Wallet, 
  Share2, 
  Gift, 
  TrendingUp,
  Star,
  Crown,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import WithdrawalModal from "@/components/ui/modals/WithdrawalModal";
import { useGetWithdrawalStatus } from "@/integrations/supabase/hooks/withdrawal";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

const Earnings = () => {
  const { user } = useAuth();
  const { getReferrals, getEarnings, getReferralCode } = useReferrals();
  const { data: referrals = [], isLoading: isLoadingReferrals } =
    getReferrals();
  const { data: earnings, isLoading: isLoadingEarnings } = getEarnings();
  const { data: pending } = useGetWithdrawalStatus(user?.id);
  const { data: referralCode = "", isLoading: isLoadingReferralCode } =
    getReferralCode();
  const [modal, setModal] = useState(false);

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied to clipboard!");
  };

  if (isLoadingReferrals || isLoadingEarnings || isLoadingReferralCode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20">
        <div className="container mx-auto p-4 sm:p-6 space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Refer & Earn Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Share the Love, <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">Earn Rewards!</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Invite friends to join SheBalance and earn ₦500 for every successful referral. The more you share, the more you earn!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Referral Code Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Share2 className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Your Referral Code</CardTitle>
                    <CardDescription className="text-blue-100">Share this with friends</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/20">
                  <code className="text-lg font-bold font-mono text-white">{referralCode}</code>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyReferralCode} 
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={copyReferralCode}
                  className="w-full mt-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Code
                </Button>
              </CardContent>
            </Card>

            {/* Total Earnings Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Total Earnings</CardTitle>
                    <CardDescription className="text-green-100">Lifetime referral income</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">₦{(earnings?.total_earnings || 0).toLocaleString()}</span>
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Users className="w-4 h-4 text-green-200" />
                  <span className="text-green-100 text-sm">{referrals.length} referrals</span>
          </div>
              </CardContent>
            </Card>

            {/* Available Balance Card */}
            <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-white">Available Balance</CardTitle>
                    <CardDescription className="text-purple-100">Ready for withdrawal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold">₦{(earnings?.available_balance || 0).toLocaleString()}</span>
                  <DollarSign className="w-6 h-6 text-yellow-300" />
                </div>
            <Button
              onClick={() => setModal(true)}
                  className="w-full mt-4 bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                  disabled={(earnings?.available_balance || 0) < 5000}
            >
                  <Wallet className="w-4 h-4 mr-2" />
                  {(earnings?.available_balance || 0) < 5000 ? `Need ₦${5000 - (earnings?.available_balance || 0)} more` : 'Withdraw Now'}
            </Button>
              </CardContent>
            </Card>
          </div>

          {/* Pending Withdrawals Alert */}
          {pending && pending?.length > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200">Pending Withdrawal Request</h3>
                    <p className="text-amber-700 dark:text-amber-300">
                      You have {pending?.length} pending withdrawal {pending.length > 1 ? "requests" : "request"} totaling{" "}
                      <span className="font-bold">₦{pending?.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</span>
              </p>
            </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
            {/* Referral History */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle>Referral History</CardTitle>
                      <CardDescription>Track your successful referrals and earnings</CardDescription>
                    </div>
        </div>
                </CardHeader>
                <CardContent>
            {referrals.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No referrals yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">Start sharing your referral code to earn rewards!</p>
                      <Button onClick={copyReferralCode} className="bg-blue-600 hover:bg-blue-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Your Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                {referrals.map((referral) => (
                        <div key={referral.referral_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow space-y-3 sm:space-y-0">
                          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {referral.referred_user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {referral.referred_user.email}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Joined {format(new Date(referral.created_at), "MMM dd, yyyy")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-3">
                            <Badge 
                              className={`text-xs ${referral.is_subscribed 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              }`}
                            >
                              {referral.is_subscribed ? (
                                <CheckCircle className="w-3 h-3 mr-1" />
                              ) : (
                                <Clock className="w-3 h-3 mr-1" />
                              )}
                        {referral.is_subscribed ? "Subscribed" : "Free Plan"}
                      </Badge>
                            <div className="text-right">
                              <p className="font-bold text-green-600 dark:text-green-400">
                                ₦{referral.amount > 0 ? "500" : "0"}
                              </p>
                            </div>
                          </div>
                  </div>
                ))}
              </div>
            )}
                </CardContent>
              </Card>
          </div>

            {/* Sidebar */}
            <div className="space-y-4 lg:space-y-6 order-1 lg:order-2">
              {/* How It Works */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Gift className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle>How It Works</CardTitle>
                      <CardDescription>Simple steps to earn</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Share Your Code</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Send your referral code to friends and colleagues</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 dark:text-green-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">They Subscribe</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your friend signs up and subscribes to a paid plan</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">You Earn ₦500</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Instant credit to your earnings balance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle>Terms & Conditions</CardTitle>
                      <CardDescription>Program guidelines</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Earn ₦500 per successful referral subscription</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Minimum withdrawal amount is ₦5,000</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Withdrawals processed within 3-5 business days</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Fraudulent referrals will be invalidated</span>
                    </li>
            </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <WithdrawalModal isOpen={modal} setOpen={setModal} balance={earnings?.available_balance || 0} total_balance={earnings?.total_earnings || 0} />
    </>
  );
};

export default Earnings;
