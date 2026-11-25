export type UserRole =
  | 'CUSTOMER'
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'PRODUCT_MANAGER'
  | 'ORDER_MANAGER'
  | 'CUSTOMER_SUPPORT'
  | 'FINANCE_MANAGER';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  loyaltyPoints?: number;
}

export type OrderStatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export type PaymentMethodType = 'UPI' | 'CARD' | 'NETBANKING' | 'COD' | 'RAZORPAY';

export interface ProductVariantItem {
  id: string;
  title: string;
  sku: string;
  price: number;
  mrp: number;
  stock: number;
  colorName?: string | null;
  colorHex?: string | null;
  size?: string | null;
  storage?: string | null;
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategoryId?: string | null;
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brandId?: string | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
  } | null;
  sku: string;
  mrp: number;
  price: number;
  discountPercent: number;
  taxRate: number;
  stock: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  isDealOfTheDay: boolean;
  dealEndTime?: string | Date | null;
  status: string;
  sellerName: string;
  highlights?: string | null;
  specifications?: string | null;
  warrantyInfo?: string | null;
  images: {
    id: string;
    url: string;
    altText?: string | null;
    isPrimary: boolean;
  }[];
  variants?: ProductVariantItem[];
}

export interface CartItemType {
  id: string;
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  mrp: number;
  quantity: number;
  variantId?: string | null;
  variantTitle?: string | null;
  stock: number;
}

export interface AddressType {
  id: string;
  fullName: string;
  phone: string;
  pincode: string;
  flatHouse: string;
  areaColony: string;
  landmark?: string | null;
  city: string;
  state: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  isDefault: boolean;
}

export interface CouponType {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  description?: string | null;
}
