'use client';

import React, { useState } from 'react';
import { usePincode } from '@/context/PincodeContext';
import { MapPin, X, Check, Search, ShieldCheck, Navigation, Loader2, Home, Compass } from 'lucide-react';

export function PincodeModal() {
  const { pincode, checkPincode, isPincodeModalOpen, setIsPincodeModalOpen } = usePincode();
  const [inputPin, setInputPin] = useState(pincode);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);

  // Exact location details
  const [detectedLocation, setDetectedLocation] = useState<{
    city: string;
    state: string;
    area: string;
    pincode: string;
  } | null>(null);
  const [roomNo, setRoomNo] = useState('');
  const [landmark, setLandmark] = useState('');

  if (!isPincodeModalOpen) return null;

  const popularPincodes = [
    { city: 'Hyderabad (Hub)', pin: '500043' },
    { city: 'Bengaluru', pin: '560001' },
    { city: 'New Delhi', pin: '110001' },
    { city: 'Mumbai', pin: '400001' },
    { city: 'Hyderabad', pin: '500001' },
    { city: 'Chennai', pin: '600001' },
    { city: 'Kolkata', pin: '700001' },
  ];

  const handleApply = async (pinToApply: string) => {
    setChecking(true);
    setStatusMsg(null);
    const res = await checkPincode(pinToApply);
    setChecking(false);
    if (res.success && res.info) {
      if (roomNo.trim() || landmark.trim()) {
        localStorage.setItem(
          'almarto_unit_location',
          JSON.stringify({ roomNo: roomNo.trim(), landmark: landmark.trim() })
        );
      }
      setStatusMsg({
        text: `Delivery serviceable in ${res.info.city}! Delivery in ${res.info.estimatedDays} days.`,
      });
      setTimeout(() => {
        setIsPincodeModalOpen(false);
      }, 900);
    } else {
      setStatusMsg({ text: res.message || 'Invalid PIN code', isError: true });
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({ text: 'Geolocation is not supported by your browser', isError: true });
      return;
    }

    setDetectingGps(true);
    setStatusMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          if (!res.ok) throw new Error('Location lookup failed');
          const data = await res.json();

          if (data.pincode) {
            setInputPin(data.pincode);
            setDetectedLocation({
              city: data.city,
              state: data.state,
              area: data.area,
              pincode: data.pincode,
            });
            await handleApply(data.pincode);
          } else if (data.city) {
            setStatusMsg({
              text: `Detected ${data.city}, ${data.state}. Please confirm your 6-digit PIN code below.`,
            });
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({
            text: 'Could not fetch address details for this location. Please enter your PIN code manually.',
            isError: true,
          });
        } finally {
          setDetectingGps(false);
        }
      },
      (error) => {
        setDetectingGps(false);
        let errorTxt = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          errorTxt = 'Location access was denied. Please allow location permissions in your browser or enter your PIN code below.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorTxt = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorTxt = 'Location request timed out. Please enter your PIN code manually.';
        }
        setStatusMsg({ text: errorTxt, isError: true });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#FAF6F0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#DED6C7]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E332B] to-[#2E4A3E] text-[#FAF6F0] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#8DA38A]" />
            <h3 className="font-extrabold text-base">Select Delivery Location</h3>
          </div>
          <button
            onClick={() => setIsPincodeModalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-bold text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* 1. Primary "Use My Current Location" Button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={detectingGps}
            className="w-full bg-[#527863] hover:bg-[#3E5C4B] text-[#FAF6F0] font-extrabold p-3 rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-60"
          >
            {detectingGps ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Detecting exact GPS location...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 fill-white" />
                <span>Use My Current Location</span>
              </>
            )}
          </button>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                statusMsg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusMsg.isError ? (
                <X className="w-4 h-4 shrink-0 text-red-600" />
              ) : (
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Detected location banner & unit inputs */}
          {detectedLocation && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-[#35109B] font-bold">
                <MapPin className="w-4 h-4 text-[#FF7900]" />
                <span>Detected: {detectedLocation.city}, {detectedLocation.state} ({detectedLocation.pincode})</span>
              </div>
              {detectedLocation.area && (
                <p className="text-[11px] text-gray-500 pl-5">{detectedLocation.area}</p>
              )}

              {/* Room No & Landmark */}
              <div className="grid grid-cols-2 gap-2 pt-1 pl-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5 flex items-center space-x-1">
                    <Home className="w-3 h-3 text-[#35109B]" />
                    <span>Room / Flat / House No.</span>
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="e.g. Room 402, B-Block"
                    className="w-full p-2 border border-[#DED6C7] rounded-lg text-xs bg-[#FAF6F0] text-[#1B2721]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 mb-0.5 flex items-center space-x-1">
                    <Compass className="w-3 h-3 text-[#527863]" />
                    <span>Landmark</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full p-2 border border-[#DED6C7] rounded-lg text-xs bg-[#FAF6F0] text-[#1B2721]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-0.5">
            — OR ENTER PIN CODE MANUALLY —
          </div>

          {/* Manual PIN Code input */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                value={inputPin}
                onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit PIN code"
                className="w-full px-3.5 py-2.5 pl-9 border border-[#DED6C7] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2E4A3E] text-[#1B2721] bg-[#FAF6F0] font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApply(inputPin);
                }}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
            <button
              onClick={() => handleApply(inputPin)}
              disabled={checking || inputPin.length !== 6}
              className="bg-[#2E4A3E] hover:bg-[#22382F] disabled:opacity-50 text-[#FAF6F0] font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              {checking ? 'Checking...' : 'Apply'}
            </button>
          </div>

          {/* Popular Cities */}
          <div className="pt-2 border-t border-[#DED6C7]">
            <span className="text-[10px] font-bold text-[#5F6E66] uppercase tracking-wider block mb-2">
              Popular Cities
            </span>
            <div className="grid grid-cols-2 gap-2">
              {popularPincodes.map((item) => (
                <button
                  key={item.pin}
                  onClick={() => {
                    setInputPin(item.pin);
                    handleApply(item.pin);
                  }}
                  className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                    pincode === item.pin
                      ? 'border-[#2E4A3E] bg-[#DFE8DD] text-[#2E4A3E]'
                      : 'border-[#DED6C7] hover:border-[#2E4A3E] bg-[#FAF6F0] text-[#1B2721]'
                  }`}
                >
                  <span>{item.city}</span>
                  <span className="text-[#5F6E66] font-mono text-[10px]">{item.pin}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-[#5F6E66] bg-[#EFE9DF] p-2.5 rounded-xl border border-[#DED6C7]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Over 19,000+ PIN codes covered with verified courier partners</span>
          </div>
        </div>
      </div>
    </div>
  );
}
