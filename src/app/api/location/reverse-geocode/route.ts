import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({ message: 'Latitude and Longitude are required' }, { status: 400 });
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=18&addressdetails=1`;

    const res = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'AlmartoECommerce/1.0 (support@almarto.com)',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ message: 'Failed to reverse geocode location' }, { status: 502 });
    }

    const data = await res.json();
    const addr = data.address || {};

    // Extract PIN code (postcode in India is 6 digits)
    let pincode = addr.postcode || '';
    if (pincode && pincode.includes(';')) {
      pincode = pincode.split(';')[0].trim();
    }
    const pinMatch = pincode.match(/\d{6}/);
    if (pinMatch) {
      pincode = pinMatch[0];
    }

    // Extract City
    const city =
      addr.city ||
      addr.town ||
      addr.village ||
      addr.municipality ||
      addr.city_district ||
      addr.district ||
      addr.county ||
      '';

    // Extract State
    const state = addr.state || '';

    // Extract Road / Colony / Area
    const areaParts = [
      addr.suburb,
      addr.neighbourhood,
      addr.residential,
      addr.road,
      addr.hamlet,
    ].filter(Boolean);
    const area = areaParts.join(', ');

    return NextResponse.json({
      success: true,
      pincode: pincode || '',
      city: city || 'India',
      state: state || '',
      area: area || '',
      suburb: addr.suburb || addr.neighbourhood || '',
      road: addr.road || '',
      displayName: data.display_name || '',
    });
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ message: 'Internal error detecting location' }, { status: 500 });
  }
}
