import { NextRequest } from 'next/server';
import { forwardAdminRequest } from '@/lib/admin-api';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return forwardAdminRequest(request, `/products/${id}`, 'PATCH');
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return forwardAdminRequest(request, `/products/${id}`, 'DELETE');
}
