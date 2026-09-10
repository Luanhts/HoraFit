import { NextRequest } from 'next/server';
import { forwardAdminRequest } from '@/lib/admin-api';

export async function POST(request: NextRequest) {
  return forwardAdminRequest(request, '/products', 'POST');
}
