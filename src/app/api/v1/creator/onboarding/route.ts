import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2025-01-27.acacia'
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'CREATOR') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })

    // Simulate generating a Stripe Connect onboarding link
    let accountId = user?.payout_account_id

    if (!accountId) {
      if (process.env.STRIPE_SECRET_KEY) {
         const account = await stripe.accounts.create({ type: 'express' })
         accountId = account.id
      } else {
         accountId = `acct_mock_${Date.now()}` // Mock fallback
      }

      await prisma.user.update({
          where: { id: session.user.id },
          data: { payout_account_id: accountId }
      })
    }

    const mockOnboardingUrl = `https://connect.stripe.com/express/setup/mock-link-for-${accountId}`

    return NextResponse.json({ url: mockOnboardingUrl })
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate onboarding link" }, { status: 500 })
  }
}
