/**
 * Demo Message Tracking Utility
 * Tracks how many demo messages a non-logged-in user has sent
 * Uses localStorage to persist across page refreshes
 */

const DEMO_LIMIT = 5
const STORAGE_KEY = 'jobbcoachen_demo_messages'

export interface DemoMessageData {
  count: number
  lastUsed: string
}

/**
 * Get the number of demo messages remaining for the current user
 */
export function getDemoMessagesRemaining(): number {
  if (typeof window === 'undefined') return DEMO_LIMIT

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEMO_LIMIT

    const data: DemoMessageData = JSON.parse(stored)
    const used = data.count || 0
    return Math.max(0, DEMO_LIMIT - used)
  } catch (error) {
    console.error('Error reading demo message count:', error)
    return DEMO_LIMIT
  }
}

/**
 * Increment the demo message count
 */
export function incrementDemoMessageCount(): void {
  if (typeof window === 'undefined') return

  try {
    const current = DEMO_LIMIT - getDemoMessagesRemaining()
    const data: DemoMessageData = {
      count: current + 1,
      lastUsed: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error incrementing demo message count:', error)
  }
}

/**
 * Reset the demo message count (useful for testing or after user logs in)
 */
export function resetDemoMessages(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error resetting demo message count:', error)
  }
}

/**
 * Check if the user has used all demo messages
 */
export function isDemoLimitReached(): boolean {
  return getDemoMessagesRemaining() === 0
}

/**
 * Get the demo message data (for debugging)
 */
export function getDemoMessageData(): DemoMessageData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    return JSON.parse(stored)
  } catch (error) {
    console.error('Error reading demo message data:', error)
    return null
  }
}
