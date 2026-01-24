import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyRange(low: number, high: number): string {
  if (low === high) {
    return formatCurrency(low);
  }
  return `${formatCurrency(low)} - ${formatCurrency(high)}`;
}

export function getSkillLevelColor(level: string): string {
  switch (level) {
    case 'DIY':
      return 'text-green-600 bg-green-100';
    case 'Intermediate':
      return 'text-yellow-600 bg-yellow-100';
    case 'Professional':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Minor':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'Moderate':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'Severe':
      return 'text-orange-600 bg-orange-100 border-orange-200';
    case 'Critical':
      return 'text-red-600 bg-red-100 border-red-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

export function getRecommendationColor(recommendation: string): string {
  switch (recommendation) {
    case 'Economical to Repair':
      return 'text-green-700 bg-green-50 border-green-300';
    case 'Borderline':
      return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    case 'Consider Total Loss':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-700 bg-gray-50 border-gray-300';
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function getMediaType(file: File): string {
  return file.type || 'image/jpeg';
}
