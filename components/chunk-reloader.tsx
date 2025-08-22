'use client'

import * as React from 'react'

function isChunkError(event: ErrorEvent): boolean {
	const message = event?.error?.message || event?.message || ''
	const name = (event?.error as any)?.name
	return (
		name === 'ChunkLoadError' ||
		message.includes('ChunkLoadError') ||
		message.includes('Loading chunk') ||
		message.includes('Chunk load failed')
	)
}

async function clearCachesAndReload() {
	try {
		if ('caches' in window) {
			const keys = await caches.keys()
			await Promise.all(keys.map((k) => caches.delete(k)))
		}
		if ('serviceWorker' in navigator) {
			const regs = await navigator.serviceWorker.getRegistrations()
			await Promise.all(regs.map((r) => r.unregister()))
		}
	} finally {
		const url = new URL(window.location.href)
		url.searchParams.set('reload', String(Date.now()))
		window.location.replace(url.toString())
	}
}

export function ChunkReloader() {
	React.useEffect(() => {
		const onError = (e: ErrorEvent) => {
			if (isChunkError(e)) {
				clearCachesAndReload()
			}
		}
		window.addEventListener('error', onError)
		return () => window.removeEventListener('error', onError)
	}, [])

	return null
}


