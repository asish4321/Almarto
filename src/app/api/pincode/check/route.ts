import { NextResponse } from 'next/server';

// Realistic Indian PIN code routing map
const PINCODE_MAP: Record<string, { city: string; state: string; days: number; cod: boolean; courier: string }> = {
  // Karnataka (Hub location)
  '560': { city: 'Bengaluru', state: 'Karnataka', days: 1, cod: true, courier: 'DELHIVERY' },
  '570': { city: 'Mysuru', state: 'Karnataka', days: 2, cod: true, courier: 'DELHIVERY' },
  '575': { city: 'Mangaluru', state: 'Karnataka', days: 2, cod: true, courier: 'BLUEDART' },
  '580': { city: 'Hubballi', state: 'Karnataka', days: 2, cod: true, courier: 'DELHIVERY' },
  // Delhi NCR
  '110': { city: 'New Delhi', state: 'Delhi', days: 2, cod: true, courier: 'DELHIVERY' },
  '122': { city: 'Gurugram', state: 'Haryana', days: 2, cod: true, courier: 'BLUEDART' },
  '201': { city: 'Noida', state: 'Uttar Pradesh', days: 2, cod: true, courier: 'DELHIVERY' },
  // Maharashtra
  '400': { city: 'Mumbai', state: 'Maharashtra', days: 2, cod: true, courier: 'BLUEDART' },
  '411': { city: 'Pune', state: 'Maharashtra', days: 2, cod: true, courier: 'DELHIVERY' },
  // Tamil Nadu
  '600': { city: 'Chennai', state: 'Tamil Nadu', days: 2, cod: true, courier: 'DELHIVERY' },
  '641': { city: 'Coimbatore', state: 'Tamil Nadu', days: 2, cod: true, courier: 'BLUEDART' },
  // Telangana & Andhra
  '500': { city: 'Hyderabad', state: 'Telangana', days: 2, cod: true, courier: 'DELHIVERY' },
  '530': { city: 'Visakhapatnam', state: 'Andhra Pradesh', days: 3, cod: true, courier: 'DELHIVERY' },
  // West Bengal
  '700': { city: 'Kolkata', state: 'West Bengal', days: 3, cod: true, courier: 'BLUEDART' },
  // Gujarat
  '380': { city: 'Ahmedabad', state: 'Gujarat', days: 2, cod: true, courier: 'DELHIVERY' },
  '395': { city: 'Surat', state: 'Gujarat', days: 2, cod: true, courier: 'DELHIVERY' },
  // Rajasthan
  '302': { city: 'Jaipur', state: 'Rajasthan', days: 3, cod: true, courier: 'DELHIVERY' },
  // Kerala
  '682': { city: 'Kochi', state: 'Kerala', days: 2, cod: true, courier: 'BLUEDART' },
  '695': { city: 'Thiruvananthapuram', state: 'Kerala', days: 3, cod: true, courier: 'DELHIVERY' },
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode')?.trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { isServiceable: false, message: 'Please enter a valid 6-digit Indian PIN code' },
      { status: 400 }
    );
  }

  const prefix3 = pincode.slice(0, 3);
  const mapped = PINCODE_MAP[prefix3];

  if (mapped) {
    return NextResponse.json({
      isServiceable: true,
      pincode,
      city: mapped.city,
      state: mapped.state,
      estimatedDays: mapped.days,
      codAvailable: mapped.cod,
      courierPartner: mapped.courier,
      message: `Delivery available in ${mapped.days} days by ${mapped.courier}`,
    });
  }

  // Any standard 6-digit Indian PIN code default
  return NextResponse.json({
    isServiceable: true,
    pincode,
    city: 'India Region',
    state: 'India',
    estimatedDays: 4,
    codAvailable: true,
    courierPartner: 'SHIPROCKET',
    message: 'Delivery available in 3-4 business days',
  });
}
