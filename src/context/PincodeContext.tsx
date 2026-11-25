'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedDays: number;
  codAvailable: boolean;
  courierPartner: string;
}

interface PincodeContextType {
  pincode: string;
  pincodeInfo: PincodeInfo;
  checkPincode: (pin: string) => Promise<{ success: boolean; info?: PincodeInfo; message?: string }>;
  setPincodeManually: (pin: string) => void;
  isPincodeModalOpen: boolean;
  setIsPincodeModalOpen: (open: boolean) => void;
}

const DEFAULT_PINCODE_INFO: PincodeInfo = {
  pincode: '500043',
  city: 'Hyderabad',
  state: 'Telangana',
  isServiceable: true,
  estimatedDays: 2,
  codAvailable: true,
  courierPartner: 'DELHIVERY',
};

const PincodeContext = createContext<PincodeContextType | undefined>(undefined);

export function PincodeProvider({ children }: { children: React.ReactNode }) {
  const [pincode, setPincode] = useState<string>('560001');
  const [pincodeInfo, setPincodeInfo] = useState<PincodeInfo>(DEFAULT_PINCODE_INFO);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);

  // Sync from localStorage after mount — must happen client-side only to avoid hydration mismatch
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem('almarto_pincode');
      const savedInfo = localStorage.getItem('almarto_pincode_info');
      if (savedPin) setPincode(savedPin);
      if (savedInfo) setPincodeInfo(JSON.parse(savedInfo));
    } catch { /* ignore */ }
  }, []);

  const checkPincode = async (pin: string) => {
    const cleanPin = pin.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return { success: false, message: 'Please enter a valid 6-digit Indian PIN code' };
    }

    try {
      const res = await fetch(`/api/pincode/check?pincode=${cleanPin}`);
      const data = await res.json();
      if (res.ok && data.isServiceable) {
        const info: PincodeInfo = {
          pincode: cleanPin,
          city: data.city || 'India',
          state: data.state || 'General',
          isServiceable: true,
          estimatedDays: data.estimatedDays || 3,
          codAvailable: data.codAvailable !== false,
          courierPartner: data.courierPartner || 'DELHIVERY',
        };
        setPincode(cleanPin);
        setPincodeInfo(info);
        localStorage.setItem('almarto_pincode', cleanPin);
        localStorage.setItem('almarto_pincode_info', JSON.stringify(info));
        return { success: true, info };
      } else {
        return { success: false, message: data.message || 'Delivery not serviceable to this PIN code currently.' };
      }
    } catch {
      // Fallback calculation for demonstration
      const info: PincodeInfo = {
        pincode: cleanPin,
        city: cleanPin.startsWith('50') ? 'Hyderabad' : cleanPin.startsWith('56') ? 'Bengaluru' : cleanPin.startsWith('11') ? 'New Delhi' : cleanPin.startsWith('40') ? 'Mumbai' : 'Major City',
        state: cleanPin.startsWith('50') ? 'Telangana' : cleanPin.startsWith('56') ? 'Karnataka' : cleanPin.startsWith('11') ? 'Delhi' : cleanPin.startsWith('40') ? 'Maharashtra' : 'India',
        isServiceable: true,
        estimatedDays: cleanPin.startsWith('50') ? 1 : cleanPin.startsWith('56') ? 2 : 3,
        codAvailable: true,
        courierPartner: 'DELHIVERY',
      };
      setPincode(cleanPin);
      setPincodeInfo(info);
      return { success: true, info };
    }
  };

  const setPincodeManually = (pin: string) => {
    checkPincode(pin);
  };

  return (
    <PincodeContext.Provider
      value={{
        pincode,
        pincodeInfo,
        checkPincode,
        setPincodeManually,
        isPincodeModalOpen,
        setIsPincodeModalOpen,
      }}
    >
      {children}
    </PincodeContext.Provider>
  );
}

export function usePincode() {
  const context = useContext(PincodeContext);
  if (!context) {
    throw new Error('usePincode must be used within a PincodeProvider');
  }
  return context;
}
