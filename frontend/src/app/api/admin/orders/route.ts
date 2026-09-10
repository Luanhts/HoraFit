import { NextRequest } from 'next/server';
import { forwardAdminRequest } from '@/lib/admin-api';

export async function GET(request: NextRequest) {
  return forwardAdminRequest(request, '/orders', 'GET');
}
