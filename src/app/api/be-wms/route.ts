// Backwards-compatible alias for /api/wms/be
import { NextRequest } from 'next/server'
import { GET as wms } from '../wms/[id]/route'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return wms(req, { params: Promise.resolve({ id: 'be' }) })
}
