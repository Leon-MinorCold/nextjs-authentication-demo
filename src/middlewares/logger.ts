import { NextRequest, NextResponse } from 'next/server'

export function loggerMiddleware(req: NextRequest) {
	console.log(`Request made to: ${req.url}`)
	return NextResponse.next()
}
