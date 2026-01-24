# CarDamage AI - Car Damage Assessment App

An AI-powered web application that helps car owners assess damage to their vehicles by analyzing uploaded photos. The app uses Claude's vision capabilities to identify damaged parts, estimate repair costs, and provide recommendations on whether to repair or replace the vehicle.

## Features

- **AI-Powered Damage Assessment**: Upload photos of vehicle damage and receive instant analysis
- **Detailed Part Identification**: Identifies all damaged parts with severity ratings
- **Cost Estimation**: Provides estimates for parts and labor costs
- **Skill Level Assessment**: Recommends whether repairs are DIY, Intermediate, or Professional level
- **Hidden Damage Detection**: Identifies potential hidden damage that may not be visible
- **Market Value Comparison**: Compares repair costs to vehicle market value
- **Repair Recommendation**: Advises whether repair is economical or if the vehicle should be considered a total loss
- **eBay Parts Search**: Optional upgrade to search for compatible replacement parts on eBay

## Pricing

- **Free Preview**: High-level damage assessment, part list, and safety warnings
- **Full Report ($1.99)**: Detailed cost breakdown, market value comparison, and repair recommendations
- **eBay Parts Search (+$0.49)**: Search for replacement parts on eBay with guaranteed fit

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **AI**: Anthropic Claude API (Vision)
- **Payments**: Stripe
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key (get one at https://console.anthropic.com/)
- Stripe API keys (optional, for real payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd car-damage-assessor
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
STRIPE_SECRET_KEY=sk_test_xxx (optional)
STRIPE_PUBLISHABLE_KEY=pk_test_xxx (optional)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── assess/           # Damage assessment API
│   │   ├── payment/          # Stripe payment API
│   │   └── ebay/            # eBay parts search API
│   ├── assessment/[id]/      # Assessment results page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── assessment/          # Assessment-specific components
│   └── payment/             # Payment components
├── lib/
│   └── utils.ts            # Utility functions
└── types/
    └── assessment.ts       # TypeScript types
```

## API Routes

### POST /api/assess
Analyzes uploaded images and creates a damage assessment.

**Request Body:**
```json
{
  "images": [
    {
      "data": "base64_encoded_image",
      "mediaType": "image/jpeg"
    }
  ],
  "vehicleInfo": {
    "year": 2020,
    "make": "Toyota",
    "model": "Camry"
  }
}
```

### GET /api/assess/[id]
Retrieves a previously created assessment.

### POST /api/payment/create-checkout
Creates a Stripe checkout session for payment.

### GET /api/payment/status/[id]
Gets payment status for an assessment.

### POST /api/ebay/search
Searches eBay for replacement parts (requires eBay upgrade).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key for payments |
| `STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |
| `NEXT_PUBLIC_BASE_URL` | No | Base URL for redirects |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- AWS Amplify
- Netlify
- Railway
- Docker

## Notes

- **Demo Mode**: Without Stripe keys, payments are simulated and content is unlocked immediately
- **Storage**: The current implementation uses in-memory storage. For production, integrate with a database (Supabase, PostgreSQL, etc.)
- **eBay Integration**: Currently uses mock data. For production, integrate with eBay Browse API

## License

MIT
