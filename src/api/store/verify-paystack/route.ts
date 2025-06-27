import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { reference } = req.body as { reference: string }

  if (!reference) {
    return res.status(400).json({ error: "Missing payment reference" })
  }

  try {
    // Verify payment with Paystack API
    const paystackKey = process.env.PAYSTACK_SECRET_KEY
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json'
      }
    })

    const verifyData = await verifyResponse.json()

    if (verifyData.status && verifyData.data.status === 'success') {
      return res.json({ 
        success: true, 
        verified: true,
        amount: verifyData.data.amount,
        currency: verifyData.data.currency,
        reference: verifyData.data.reference
      })
    } else {
      return res.status(400).json({ error: "Payment verification failed" })
    }

  } catch (error) {
    console.error("Payment verification error:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
} 