'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  Zap,
  DollarSign,
  Shield,
  CheckCircle,
  ArrowRight,
  Camera,
  FileText,
  Search,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { ImageUpload, VehicleInfoForm } from '@/components/assessment';
import { fileToBase64, getMediaType } from '@/lib/utils';

interface VehicleInfo {
  year?: number;
  make?: string;
  model?: string;
}

export default function HomePage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image of the damage.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // Convert images to base64 with media types
      const imageData = await Promise.all(
        images.map(async (file) => ({
          data: await fileToBase64(file),
          mediaType: getMediaType(file),
        }))
      );

      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imageData,
          vehicleInfo,
        }),
      });

      const data = await response.json();

      if (response.ok && data.assessmentId) {
        router.push(`/assessment/${data.assessmentId}`);
      } else {
        setError(data.error || 'Failed to analyze images. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Get an Instant AI Assessment of Your Car Damage
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Upload photos of your damaged vehicle and receive a comprehensive assessment
                in seconds. Know repair costs, identify parts, and decide whether to repair
                or replace.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="#assess"
                  className="inline-flex items-center px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Start Assessment
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
                      <p className="font-semibold">Instant Analysis</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-300" />
                      <p className="font-semibold">Cost Estimates</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-blue-300" />
                      <p className="font-semibold">Safety Alerts</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 text-center">
                      <Search className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                      <p className="font-semibold">Parts Search</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment Section */}
      <section id="assess" className="py-16 -mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="shadow-2xl">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Upload Your Damage Photos
                </h2>
                <p className="text-gray-600">
                  Add photos of your vehicle damage to get started
                </p>
              </div>

              <div className="space-y-6">
                <ImageUpload
                  images={images}
                  onImagesChange={setImages}
                  maxImages={5}
                  disabled={isAnalyzing}
                />

                <VehicleInfoForm
                  vehicleInfo={vehicleInfo}
                  onVehicleInfoChange={setVehicleInfo}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={images.length === 0}
                  isLoading={isAnalyzing}
                  size="lg"
                  className="w-full"
                >
                  {isAnalyzing ? (
                    'Analyzing Damage...'
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Analyze Damage - Free Preview
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Free high-level assessment. Full report with pricing: $1.99
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your car damage assessment in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Photos</h3>
              <p className="text-gray-600">
                Take clear photos of your vehicle damage from multiple angles and upload
                them to our platform.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your images to identify damage, assess severity,
                and estimate repair requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto -mt-12 mb-4 font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Report</h3>
              <p className="text-gray-600">
                Receive a detailed assessment with cost estimates, repair recommendations,
                and market value comparison.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Pay only for what you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Preview</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                $0
                <span className="text-base font-normal text-gray-500">/assessment</span>
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Damage severity assessment</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">List of damaged parts</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Repair skill level required</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Safety warnings</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Get Started
              </Button>
            </Card>

            {/* Full Report */}
            <Card variant="elevated" className="p-6 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Full Report</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                $1.99
                <span className="text-base font-normal text-gray-500">/assessment</span>
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Everything in Free Preview</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Detailed cost breakdown</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Parts & labor estimates</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Hidden damage analysis</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Market value comparison</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Repair recommendation</span>
                </li>
              </ul>
              <Button className="w-full">
                Get Full Report
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            {/* eBay Upgrade */}
            <Card variant="bordered" className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">eBay Parts Add-on</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                +$0.49
                <span className="text-base font-normal text-gray-500">/assessment</span>
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Search eBay Guaranteed Fit</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Compare parts prices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Direct purchase links</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600">Seller ratings & reviews</span>
                </li>
              </ul>
              <Button variant="secondary" className="w-full">
                Add eBay Search
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                How accurate are the damage assessments?
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                Our AI provides estimates based on visible damage in the photos. While we
                strive for accuracy, these assessments are estimates and should be
                verified by a professional mechanic or body shop before making repair
                decisions. Actual costs may vary based on location, labor rates, and
                hidden damage.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                What types of damage can you assess?
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                We can assess most types of visible vehicle damage including collision
                damage, dents, scratches, broken lights, damaged bumpers, cracked
                windshields, and more. Our AI can identify multiple types of damage from
                a single photo set.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                How do the cost estimates work?
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                Cost estimates are based on average parts prices and labor rates in the
                United States. We provide a range (low to high) to account for variations
                in part quality (OEM vs aftermarket) and regional labor rate differences.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                What is the eBay Guaranteed Fit feature?
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                The eBay add-on searches for replacement parts on eBay that are
                guaranteed to fit your specific vehicle. This helps you find affordable
                parts from reputable sellers, potentially saving money on repairs.
              </div>
            </details>

            <details className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
              <summary className="px-6 py-4 cursor-pointer font-semibold text-gray-900 flex items-center justify-between">
                Is my data secure?
                <span className="text-blue-600 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-4 text-gray-600">
                Yes, we take data security seriously. Your photos are encrypted during
                transmission and storage. We do not share your images or personal
                information with third parties. Images are automatically deleted after 30
                days.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Assess Your Car Damage?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Upload your photos now and get an instant assessment
          </p>
          <a
            href="#assess"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-lg"
          >
            <Camera className="w-6 h-6 mr-2" />
            Start Free Assessment
          </a>
        </div>
      </section>
    </div>
  );
}
