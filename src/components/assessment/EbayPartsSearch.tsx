'use client';

import { useState } from 'react';
import { Search, ExternalLink, CheckCircle, ShoppingCart, Lock, Star } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, Button, Badge, Spinner } from '@/components/ui';
import { DamagedPart, EbaySearchResult, EbayPart } from '@/types/assessment';
import { cn, formatCurrency } from '@/lib/utils';

interface EbayPartsSearchProps {
  parts: DamagedPart[];
  vehicleInfo?: {
    year?: number;
    make?: string;
    model?: string;
  };
  hasEbayUpgrade: boolean;
  onUpgrade: () => void;
  assessmentId: string;
}

export function EbayPartsSearch({
  parts,
  vehicleInfo,
  hasEbayUpgrade,
  onUpgrade,
  assessmentId,
}: EbayPartsSearchProps) {
  const [searchResults, setSearchResults] = useState<Record<string, EbaySearchResult>>({});
  const [loadingPart, setLoadingPart] = useState<string | null>(null);
  const [expandedPart, setExpandedPart] = useState<string | null>(null);

  const partsNeedingReplacement = parts.filter((p) => p.repairOrReplace === 'Replace');

  const searchEbay = async (part: DamagedPart) => {
    if (!hasEbayUpgrade) {
      onUpgrade();
      return;
    }

    setLoadingPart(part.name);
    setExpandedPart(part.name);

    try {
      const response = await fetch('/api/ebay/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partName: part.name,
          vehicleInfo,
          assessmentId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults((prev) => ({
          ...prev,
          [part.name]: data,
        }));
      }
    } catch (error) {
      console.error('eBay search error:', error);
    } finally {
      setLoadingPart(null);
    }
  };

  if (partsNeedingReplacement.length === 0) {
    return null;
  }

  if (!hasEbayUpgrade) {
    return (
      <Card variant="bordered">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600">
          <CardTitle className="flex items-center text-white">
            <ShoppingCart className="w-5 h-5 mr-2" />
            eBay Guaranteed Fit Parts
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Search eBay for Replacement Parts
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-4">
              Find compatible replacement parts on eBay with guaranteed fit for your vehicle.
              Compare prices and save money on your repairs.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {partsNeedingReplacement.length} part{partsNeedingReplacement.length !== 1 ? 's' : ''}{' '}
              identified for replacement
            </p>
            <Button onClick={onUpgrade} className="bg-purple-600 hover:bg-purple-700">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Unlock eBay Search - $0.49
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="bordered">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600">
        <CardTitle className="flex items-center text-white">
          <ShoppingCart className="w-5 h-5 mr-2" />
          eBay Guaranteed Fit Parts
        </CardTitle>
        <p className="text-purple-100 text-sm mt-1">
          Find replacement parts that fit your vehicle
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {partsNeedingReplacement.map((part) => (
          <div key={part.name} className="border rounded-lg overflow-hidden">
            <div
              className="px-4 py-3 bg-gray-50 flex items-center justify-between cursor-pointer"
              onClick={() =>
                expandedPart === part.name
                  ? setExpandedPart(null)
                  : searchEbay(part)
              }
            >
              <div>
                <h4 className="font-semibold text-gray-900">{part.name}</h4>
                <p className="text-sm text-gray-500">
                  Est. cost: {formatCurrency(part.estimatedPartCost.low)} -{' '}
                  {formatCurrency(part.estimatedPartCost.high)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  searchEbay(part);
                }}
                isLoading={loadingPart === part.name}
              >
                <Search className="w-4 h-4 mr-1" />
                Search eBay
              </Button>
            </div>

            {expandedPart === part.name && searchResults[part.name] && (
              <div className="p-4 space-y-3">
                {searchResults[part.name].results.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No results found. Try searching on eBay directly.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Found {searchResults[part.name].totalResults} results
                    </p>
                    {searchResults[part.name].results.slice(0, 5).map((item) => (
                      <EbayPartCard key={item.itemId} part={item} />
                    ))}
                  </>
                )}
              </div>
            )}

            {expandedPart === part.name && loadingPart === part.name && (
              <div className="p-8 flex justify-center">
                <Spinner />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EbayPartCard({ part }: { part: EbayPart }) {
  return (
    <a
      href={part.itemUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
    >
      {part.imageUrl && (
        <img
          src={part.imageUrl}
          alt={part.title}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <div className="flex-1 min-w-0">
        <h5 className="font-medium text-gray-900 text-sm line-clamp-2">{part.title}</h5>
        <div className="flex items-center space-x-2 mt-1">
          <span className="font-bold text-blue-600">
            {formatCurrency(part.price)}
          </span>
          {part.shippingCost !== undefined && (
            <span className="text-xs text-gray-500">
              +{formatCurrency(part.shippingCost)} shipping
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          {part.guaranteedFit && (
            <Badge variant="success" className="text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Guaranteed Fit
            </Badge>
          )}
          <Badge variant="default" className="text-xs">{part.condition}</Badge>
        </div>
        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Star className="w-3 h-3 text-yellow-500 mr-1" />
          {part.seller.feedbackPercentage}% ({part.seller.feedbackScore})
        </div>
      </div>
      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </a>
  );
}
