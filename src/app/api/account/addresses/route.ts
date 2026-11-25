import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ addresses: [] });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Fetch addresses error:', error);
    return NextResponse.json({ addresses: [] });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      phone,
      pincode,
      flatHouse,
      areaColony,
      landmark,
      city,
      state,
      addressType = 'HOME',
      isDefault = false,
    } = body;

    if (!fullName || !phone || !pincode || !flatHouse || !city || !state) {
      return NextResponse.json({ message: 'Missing required address fields' }, { status: 400 });
    }

    // If this is set as default, remove default flag from others
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    // Check count of user's existing addresses
    const count = await prisma.address.count({ where: { userId: user.id } });

    const newAddress = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        pincode: pincode.trim(),
        flatHouse: flatHouse.trim(),
        areaColony: (areaColony || '').trim(),
        landmark: landmark ? landmark.trim() : null,
        city: city.trim(),
        state: state.trim(),
        addressType: addressType || 'HOME',
        isDefault: isDefault || count === 0, // First address is default
      },
    });

    return NextResponse.json({ success: true, address: newAddress });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json({ message: 'Failed to save address' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json({ message: 'Address ID required' }, { status: 400 });
    }

    await prisma.address.deleteMany({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Address removed' });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ message: 'Failed to delete address' }, { status: 500 });
  }
}
