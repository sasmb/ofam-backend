import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import crypto from "crypto"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Verify webhook signature
    const secret = process.env.PAYSTACK_WEBHOOK_SECRET
    if (!secret) {
      console.error('PAYSTACK_WEBHOOK_SECRET not configured')
      res.status(500)
      return res.json({ error: 'Webhook secret not configured' })
    }

    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex')

    const signature = req.headers['x-paystack-signature'] as string
    
    if (hash !== signature) {
      console.error('Invalid webhook signature')
      res.status(400)
      return res.json({ error: 'Invalid signature' })
    }

    const event = req.body as any

    console.log('Paystack webhook received:', event.event)

    // Handle successful charge
    if (event.event === 'charge.success') {
      const paymentData = event.data
      const reference = paymentData?.reference

      console.log(`Processing successful payment: ${reference}`)

      // The medusa-payment-paystack plugin should automatically handle
      // payment session authorization when it receives this webhook
      console.log('✅ Payment webhook processed successfully')
    }

    res.status(200)
    res.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500)
    res.json({ error: 'Webhook processing failed' })
  }
} 