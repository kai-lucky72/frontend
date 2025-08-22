'use client'

import type React from 'react'

function isChunkLoadError(error: unknown): boolean {
	if (!error) return false
	const message = (error as any)?.message as string | undefined
	const name = (error as any)?.name as string | undefined
	return (
		name === 'ChunkLoadError' ||
		message?.includes('ChunkLoadError') ||
		message?.includes('Loading chunk') ||
		message?.includes('failed')
	)
}

async function clearCachesAndReload() {
	try {
		if ('caches' in window) {
			const cacheKeys = await caches.keys()
			await Promise.all(cacheKeys.map((key) => caches.delete(key)))
		}
		if ('serviceWorker' in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations()
			await Promise.all(registrations.map((r) => r.unregister()))
		}
	} catch (_) {
		// ignore
	} finally {
		// hard reload with cache-busting param
		const url = new URL(window.location.href)
		url.searchParams.set('reload', String(Date.now()))
		window.location.replace(url.toString())
	}
}

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
	React.useEffect(() => {
		if (isChunkLoadError(error)) {
			clearCachesAndReload()
		}
	}, [error])

	return (
		<html>
			<body>
				<div style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh', padding: 24 }}>
					<div style={{ maxWidth: 520 }}>
						<h1 style={{ fontSize: 20, marginBottom: 8 }}>Something went wrong</h1>
						<p style={{ color: '#666', marginBottom: 16 }}>
							{isChunkLoadError(error)
								? 'A new version is available. Refreshing…'
								: 'An unexpected error occurred.'}
						</p>
						<div style={{ display: 'flex', gap: 8 }}>
							<button onClick={() => (isChunkLoadError(error) ? clearCachesAndReload() : reset())}>
								Reload
							</button>
						</div>
					</div>
				</div>
			</body>
		</html>
	)
}


