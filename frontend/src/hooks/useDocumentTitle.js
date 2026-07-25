/**
 * useDocumentTitle — Sets the browser tab title.
 * Usage: useDocumentTitle('Explore')
 * Result: "Explore — StayWise"
 */
import { useEffect } from 'react'

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — StayWise` : 'StayWise — AI-Powered Homestay Management'
    return () => { document.title = prev }
  }, [title])
}
