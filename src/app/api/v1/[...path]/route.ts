import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NODE_ENV === 'production'
  ? 'https://wish-well-b0nc.onrender.com'
  : 'http://localhost:3000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, params, 'PATCH')
}

async function handleRequest(
  request: NextRequest,
  params: Promise<{ path: string[] }>,
  method: string
) {
  try {
    const resolvedParams = await params
    const path = resolvedParams.path.join('/')
    const url = `${BACKEND_URL}/api/v1/${path}`

    // Get search params from the original request
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const finalUrl = queryString ? `${url}?${queryString}` : url

    // Get headers from the original request
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      // Forward important headers, but skip some that might cause issues
      if (!['host', 'content-length', 'connection'].includes(key.toLowerCase())) {
        headers[key] = value
      }
    })

    // Get body for POST, PUT, PATCH requests
    let body: string | FormData | undefined
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = await request.text()
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData()
      } else {
        body = await request.text()
      }
    }

    const response = await fetch(finalUrl, {
      method,
      headers,
      body,
    })

    const responseData = await response.text()

    // Create response with same status and headers
    const nextResponse = new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
    })

    // Copy response headers
    response.headers.forEach((value, key) => {
      nextResponse.headers.set(key, value)
    })

    return nextResponse

  } catch (error) {
    console.error('API Proxy Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}