'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { usePincode } from '@/context/PincodeContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import {
  MapPin,
  CheckCircle2,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  Plus,
  Lock,
  Smartphone,
  Banknote,
  Building2,
  AlertCircle,
  Tag,
  XCircle,
  Navigation,
  Loader2,
  Home,
  Compass,
} from 'lucide-react';

interface AddressForm {
  fullName: string;
  phone: string;
  pincode: string;
  flatHouse: string;
  areaColony: string;
  landmark: string;
  city: string;
  state: string;
  addressType: 'HOME' | 'WORK';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useRequireAuth('/checkout');
  const { items, subtotal, mrpTotal, couponDiscount, grandTotal, appliedCoupon, clearCart, applyCoupon, removeCoupon } = useCart();
  const { pincode, pincodeInfo } = usePincode();

  // Coupon state in checkout
  const [checkoutCoupon, setCheckoutCoupon] = useState('');
  const [checkoutApplying, setCheckoutApplying] = useState(false);
  const [checkoutCouponMsg, setCheckoutCouponMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleCheckoutApplyCoupon = async (codeToApply: string) => {
    setCheckoutApplying(true);
    setCheckoutCouponMsg(null);
    const res = await applyCoupon(codeToApply);
    setCheckoutApplying(false);
    if (res.success) {
      setCheckoutCouponMsg({ text: res.message });
      setCheckoutCoupon('');
    } else {
      setCheckoutCouponMsg({ text: res.message, isError: true });
    }
  };

  // Step 1: Address (Loaded from Supabase for current user)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<AddressForm[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [newAddress, setNewAddress] = useState<AddressForm>({
    fullName: user?.name || '',
    phone: user?.phone || '',
    pincode: pincode || '',
    flatHouse: '',
    areaColony: '',
    landmark: '',
    city: pincodeInfo.city || '',
    state: pincodeInfo.state || '',
    addressType: 'HOME',
  });

  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  const handleCheckoutUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setDetectingGps(true);
    setGpsSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (!res.ok) throw new Error('Location lookup failed');
          const data = await res.json();

          setNewAddress((prev) => ({
            ...prev,
            pincode: data.pincode || prev.pincode,
            city: data.city || prev.city,
            state: data.state || prev.state,
            areaColony: data.area || prev.areaColony,
          }));

          setGpsSuccessMsg(
            `Location detected: ${data.city || ''} ${data.state ? '(' + data.state + ')' : ''} ${data.pincode || ''}. Please enter your Flat/Room No. and Landmark.`
          );
        } catch (err) {
          console.error(err);
          alert('Could not detect exact address. Please enter details manually.');
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setDetectingGps(false);
        alert(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission denied. Please allow location access or type your address.'
            : 'Could not obtain location. Please fill details manually.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Step 2: Delivery Option
  const [deliveryOption, setDeliveryOption] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');

  // Step 3: Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [captchaCode, setCaptchaCode] = useState('7842');
  const [captchaInput, setCaptchaInput] = useState('');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch real addresses from Supabase for logged in user
  useEffect(() => {
    async function loadAddresses() {
      if (!user) {
        setSavedAddresses([]);
        setIsAddingNewAddress(true);
        setLoadingAddresses(false);
        return;
      }
      try {
        const res = await fetch('/api/account/addresses');
        if (res.ok) {
          const data = await res.json();
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            setSelectedAddressIndex(0);
            setIsAddingNewAddress(false);
          } else {
            setSavedAddresses([]);
            setIsAddingNewAddress(true);
          }
        }
      } catch (err) {
        console.error('Failed to load user addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    }
    loadAddresses();
  }, [user]);

  // Sync user info to newAddress form
  useEffect(() => {
    if (user?.name && !newAddress.fullName) {
      setNewAddress((prev) => ({ ...prev, fullName: user.name }));
    }
    if (user?.phone && !newAddress.phone) {
      setNewAddress((prev) => ({ ...prev, phone: user.phone || '' }));
    }
    if (pincode && !newAddress.pincode) {
      setNewAddress((prev) => ({ ...prev, pincode }));
    }
    if (pincodeInfo.city && !newAddress.city) {
      setNewAddress((prev) => ({ ...prev, city: pincodeInfo.city }));
    }
    if (pincodeInfo.state && !newAddress.state) {
      setNewAddress((prev) => ({ ...prev, state: pincodeInfo.state }));
    }
  }, [user, pincode, pincodeInfo]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const deliveryFee = deliveryOption === 'EXPRESS' ? 99 : subtotal < 499 ? 49 : 0;
  const finalPayable = Math.max(0, subtotal - couponDiscount + deliveryFee);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.pincode || !newAddress.flatHouse || !newAddress.city || !newAddress.state) {
      alert('Please fill all required address fields.');
      return;
    }

    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddress),
      });
      if (res.ok) {
        const data = await res.json();
        const saved = data.address || newAddress;
        setSavedAddresses((prev) => [...prev, saved]);
        setSelectedAddressIndex(savedAddresses.length);
        setIsAddingNewAddress(false);
      } else {
        setSavedAddresses((prev) => [...prev, newAddress]);
        setSelectedAddressIndex(savedAddresses.length);
        setIsAddingNewAddress(false);
      }
    } catch {
      setSavedAddresses((prev) => [...prev, newAddress]);
      setSelectedAddressIndex(savedAddresses.length);
      setIsAddingNewAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    setErrorMessage(null);
    if (!user) {
      setErrorMessage('Please sign in to your account before placing an order.');
      return;
    }

    const activeAddress = savedAddresses[selectedAddressIndex];
    if (!activeAddress) {
      setErrorMessage('Please enter and save a delivery address before placing an order.');
      return;
    }

    if (paymentMethod === 'COD' && captchaInput !== captchaCode) {
      setErrorMessage('Please enter the correct 4-digit security code for Cash on Delivery confirmation.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const activeAddress = savedAddresses[selectedAddressIndex];
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingAddress: activeAddress,
          paymentMethod,
          deliveryOption,
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await res.json();
      if (res.ok && data.orderNumber) {
        clearCart();
        router.push(`/order-success/${data.orderNumber}`);
      } else {
        setErrorMessage(data.message || 'Failed to place order. Please try again.');
      }
    } catch {
      setErrorMessage('Network error while placing order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <>
    {(authLoading || !user) && (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#DFE8DD] border-t-[#2E4A3E] animate-spin" />
        <p className="text-sm font-bold text-[#2E4A3E]">Logging you in...</p>
        <p className="text-xs text-gray-400">Setting up your checkout, please wait</p>
      </div>
    )}
    {user && (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center space-x-2 text-xs text-gray-500 mb-6">
        <Link href="/cart" className="hover:text-[#35109B]">Cart</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="font-bold text-gray-800">Secure Checkout</span>
      </div>

      <h1 className="text-2xl font-black text-[#19152B] mb-6 flex items-center space-x-2">
        <Lock className="w-6 h-6 text-emerald-600" />
        <span>Almarto Secure Checkout</span>
      </h1>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Delivery Address */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#35109B] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-bold text-base text-[#19152B]">Delivery Address</h2>
              </div>
              {!isAddingNewAddress && (
                <button
                  onClick={() => setIsAddingNewAddress(true)}
                  className="text-xs font-bold text-[#FF7900] hover:underline flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {isAddingNewAddress ? (
              <form onSubmit={handleAddNewAddress} className="space-y-4 pt-2">
                {/* 1-Click Current Location GPS Auto-fill */}
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-[#35109B] flex items-center space-x-1.5">
                        <Navigation className="w-3.5 h-3.5 text-[#FF7900]" />
                        <span>Deliver to your current location?</span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Automatically detects your exact city, state, area, and postal PIN code.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckoutUseCurrentLocation}
                      disabled={detectingGps}
                      className="bg-gradient-to-r from-[#FF7900] to-[#ea580c] hover:opacity-95 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm shrink-0 disabled:opacity-60 transition-all"
                    >
                      {detectingGps ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3.5 h-3.5 fill-white" />
                          <span>Use My Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  {gpsSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{gpsSuccessMsg}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      placeholder="Receiver Full Name"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="10-digit mobile number"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">6-Digit PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                      placeholder="PIN Code"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Flat, House or Room No., Building Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.flatHouse}
                    onChange={(e) => setNewAddress({ ...newAddress, flatHouse: e.target.value })}
                    placeholder="Room No. / Flat / House / Building"
                    className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Area, Street, Colony, Sector *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.areaColony}
                      onChange={(e) => setNewAddress({ ...newAddress, areaColony: e.target.value })}
                      placeholder="Area / Street / Colony"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Nearby Landmark *</label>
                    <input
                      type="text"
                      required
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                      placeholder="Nearby Landmark (e.g. near park, metro, hospital)"
                      className="w-full p-2.5 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-2">
                  <button
                    type="submit"
                    className="bg-[#35109B] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#270A77] transition-colors"
                  >
                    Save &amp; Deliver Here
                  </button>
                  {savedAddresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsAddingNewAddress(false)}
                      className="text-xs text-gray-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx
                        ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="addressRadio"
                          checked={selectedAddressIndex === idx}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="mt-1 text-[#35109B] focus:ring-[#35109B]"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-xs text-[#19152B]">{addr.fullName}</span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-600">
                              {addr.addressType}
                            </span>
                            <span className="text-xs font-mono text-gray-600">{addr.phone}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {addr.flatHouse}, {addr.areaColony}, {addr.landmark ? `${addr.landmark}, ` : ''}{addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Delivery Speed Option */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-[#35109B] text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-base text-[#19152B]">Delivery Speed</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  deliveryOption === 'STANDARD'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliverySpeedRadio"
                  checked={deliveryOption === 'STANDARD'}
                  onChange={() => setDeliveryOption('STANDARD')}
                  className="mt-1 text-[#35109B]"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#19152B]">Standard Courier Delivery</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      FREE (Orders &gt; ₹499)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Delivered in 2-3 business days via Delhivery / BlueDart</p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  deliveryOption === 'EXPRESS'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliverySpeedRadio"
                  checked={deliveryOption === 'EXPRESS'}
                  onChange={() => setDeliveryOption('EXPRESS')}
                  className="mt-1 text-[#35109B]"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#19152B]">Express 1-Day Priority</span>
                    <span className="text-[10px] font-bold text-[#FF7900] bg-orange-50 px-2 py-0.5 rounded">
                      ₹99
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">Guaranteed next-day delivery by 1 PM</p>
                </div>
              </label>
            </div>
          </div>

          {/* STEP 3: Payment Options (UPI, Card, NetBanking, COD) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-[#35109B] text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="font-bold text-base text-[#19152B]">Select Payment Method</h2>
            </div>

            <div className="space-y-3">
              {/* 1. UPI */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'UPI'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentRadio"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="text-[#35109B]"
                    />
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-[#35109B]" />
                      <span className="font-bold text-xs text-[#19152B]">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Fastest &amp; Instant
                  </span>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="mt-3 pt-3 border-t border-purple-200/60 pl-6">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Enter your UPI ID / VPA</label>
                    <div className="flex max-w-sm space-x-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                      />
                      <span className="text-xs font-semibold text-emerald-700 self-center">✓ Verified</span>
                    </div>
                  </div>
                )}
              </label>

              {/* 2. Credit / Debit Card */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentRadio"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="text-[#35109B]"
                    />
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-[#35109B]" />
                      <span className="font-bold text-xs text-[#19152B]">Credit / Debit / ATM Card</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">Visa, MasterCard, RuPay</span>
                </div>

                {paymentMethod === 'CARD' && (
                  <div className="mt-3 pt-3 border-t border-purple-200/60 pl-6 space-y-2.5 max-w-sm">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Card Number</label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4532 •••• •••• 8892"
                        className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Valid Thru (MM/YY)</label>
                        <input
                          type="text"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-0.5">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </label>

              {/* 3. Net Banking */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'NETBANKING'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentRadio"
                    checked={paymentMethod === 'NETBANKING'}
                    onChange={() => setPaymentMethod('NETBANKING')}
                    className="text-[#35109B]"
                  />
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#35109B]" />
                    <span className="font-bold text-xs text-[#19152B]">Net Banking</span>
                  </div>
                </div>

                {paymentMethod === 'NETBANKING' && (
                  <div className="mt-3 pt-3 border-t border-purple-200/60 pl-6 max-w-sm">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    >
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </label>

              {/* 4. Cash on Delivery (COD) */}
              <label
                className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#35109B] bg-[#F2EFFF] ring-2 ring-[#35109B]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentRadio"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-[#35109B]"
                    />
                    <div className="flex items-center space-x-2">
                      <Banknote className="w-4 h-4 text-[#35109B]" />
                      <span className="font-bold text-xs text-[#19152B]">Cash on Delivery (Pay at Doorstep)</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">Verified PIN</span>
                </div>

                {paymentMethod === 'COD' && (
                  <div className="mt-3 pt-3 border-t border-purple-200/60 pl-6 max-w-sm">
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Enter the 4-digit code shown below to confirm COD order:
                    </label>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1.5 bg-gray-200 text-gray-800 font-mono font-black text-sm tracking-widest rounded select-none">
                        {captchaCode}
                      </span>
                      <input
                        type="text"
                        maxLength={4}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Enter 7842"
                        className="w-28 p-2 text-xs border rounded-lg font-mono font-bold focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                      />
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right Order Summary & Confirm (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </h3>

            {/* Quick mini-list */}
            <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-2">
              {items.map((it) => (
                <div key={it.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[180px]">
                    <span className="font-medium text-gray-800 truncate block">{it.title}</span>
                    <span className="text-gray-400 text-[11px]">Qty: {it.quantity}</span>
                  </div>
                  <span className="font-bold text-[#19152B] shrink-0">
                    ₹{(it.price * it.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Coupon Box */}
            <div className="pt-3 border-t border-gray-100">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <div>
                      <span className="font-bold">{appliedCoupon.code}</span> applied!
                      <p className="text-[10px] text-emerald-600">You saved ₹{couponDiscount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (checkoutCoupon.trim()) handleCheckoutApplyCoupon(checkoutCoupon.trim());
                    }}
                    className="flex space-x-2"
                  >
                    <input
                      type="text"
                      value={checkoutCoupon}
                      onChange={(e) => setCheckoutCoupon(e.target.value.toUpperCase())}
                      placeholder="Enter promo coupon code"
                      className="flex-1 px-3 py-1.5 text-xs uppercase border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#35109B]"
                    />
                    <button
                      type="submit"
                      disabled={checkoutApplying || !checkoutCoupon.trim()}
                      className="bg-[#35109B] hover:bg-[#270A77] disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {checkoutApplying ? '...' : 'Apply'}
                    </button>
                  </form>

                  {checkoutCouponMsg && (
                    <p className={`text-[11px] flex items-center space-x-1 ${checkoutCouponMsg.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                      {checkoutCouponMsg.isError ? <XCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                      <span>{checkoutCouponMsg.text}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price lines */}
            <div className="space-y-2 pt-3 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Shipping ({deliveryOption})</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-black text-[#19152B]">
                <span>Total Payable</span>
                <span>₹{finalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full py-4 bg-[#FF7900] hover:bg-[#ea580c] disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
            >
              {isPlacingOrder ? (
                <span>Confirming Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Place Order • ₹{finalPayable.toLocaleString('en-IN')}</span>
                </>
              )}
            </button>

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 space-y-1">
              <p className="flex items-center space-x-1 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>100% Purchase Protection Guarantee</span>
              </p>
              <p>Safe bank transmission with automated GST Tax invoice generation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    )}
    </>
  );
}
