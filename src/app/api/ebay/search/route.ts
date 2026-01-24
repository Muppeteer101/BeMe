import { NextRequest, NextResponse } from 'next/server';
import { EbaySearchResult, EbayPart } from '@/types/assessment';

interface SearchRequestBody {
  partName: string;
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
  };
  assessmentId: string;
}

// Mock eBay search results for demo
// In production, integrate with eBay Browse API
function generateMockResults(partName: string, vehicleInfo?: SearchRequestBody['vehicleInfo']): EbayPart[] {
  const vehicleDesc = vehicleInfo
    ? `${vehicleInfo.year || ''} ${vehicleInfo.make || ''} ${vehicleInfo.model || ''}`.trim()
    : '';

  const conditions = ['New', 'Certified Refurbished', 'Used - Like New', 'Used - Good'];
  const basePrice = getBasePrice(partName);

  return Array.from({ length: 5 }, (_, i) => {
    const condition = conditions[i % conditions.length];
    const priceMultiplier = condition === 'New' ? 1 : condition === 'Certified Refurbished' ? 0.85 : 0.6;
    const price = Math.round(basePrice * priceMultiplier * (0.9 + Math.random() * 0.3));

    return {
      itemId: `ebay-${Date.now()}-${i}`,
      title: `${condition} ${partName}${vehicleDesc ? ` for ${vehicleDesc}` : ''} - OEM Quality`,
      price,
      currency: 'USD',
      condition,
      imageUrl: `https://placehold.co/200x200/e2e8f0/64748b?text=${encodeURIComponent(partName.slice(0, 10))}`,
      itemUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(partName + ' ' + vehicleDesc)}`,
      seller: {
        username: `autoparts_seller_${i + 1}`,
        feedbackScore: Math.floor(1000 + Math.random() * 50000),
        feedbackPercentage: 95 + Math.random() * 4.9,
      },
      shippingCost: Math.random() > 0.3 ? Math.round(10 + Math.random() * 30) : 0,
      guaranteedFit: Math.random() > 0.3,
      compatibility: vehicleDesc || undefined,
    };
  }).sort((a, b) => a.price - b.price);
}

function getBasePrice(partName: string): number {
  const partPrices: Record<string, number> = {
    'bumper': 250,
    'front bumper': 300,
    'rear bumper': 280,
    'hood': 400,
    'fender': 200,
    'door': 350,
    'mirror': 120,
    'headlight': 180,
    'tail light': 150,
    'grille': 100,
    'windshield': 350,
    'quarter panel': 450,
    'rocker panel': 200,
    'radiator': 180,
    'condenser': 150,
    'wheel': 200,
    'rim': 200,
    'tire': 120,
  };

  const lowerName = partName.toLowerCase();
  for (const [key, price] of Object.entries(partPrices)) {
    if (lowerName.includes(key)) {
      return price;
    }
  }
  return 150; // default price
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequestBody = await request.json();
    const { partName, vehicleInfo, assessmentId } = body;

    if (!partName || !assessmentId) {
      return NextResponse.json(
        { error: 'Part name and assessment ID are required' },
        { status: 400 }
      );
    }

    // In production, check if user has paid for eBay upgrade
    // const paymentStatus = await getPaymentStatus(assessmentId);
    // if (!paymentStatus.hasPaidForEbayUpgrade) {
    //   return NextResponse.json({ error: 'eBay upgrade required' }, { status: 403 });
    // }

    // Generate search query
    const searchParts = [partName];
    if (vehicleInfo) {
      if (vehicleInfo.year) searchParts.push(vehicleInfo.year.toString());
      if (vehicleInfo.make) searchParts.push(vehicleInfo.make);
      if (vehicleInfo.model) searchParts.push(vehicleInfo.model);
    }
    const searchQuery = searchParts.join(' ');

    // In production, call eBay Browse API here
    // For demo, generate mock results
    const results = generateMockResults(partName, vehicleInfo);

    const searchResult: EbaySearchResult = {
      partName,
      searchQuery,
      results,
      totalResults: results.length + Math.floor(Math.random() * 100),
    };

    return NextResponse.json(searchResult);
  } catch (error) {
    console.error('eBay search error:', error);
    return NextResponse.json(
      { error: 'Failed to search eBay' },
      { status: 500 }
    );
  }
}
