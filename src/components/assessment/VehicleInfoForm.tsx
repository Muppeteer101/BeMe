'use client';

import { useState } from 'react';
import { Car, Calendar, Factory } from 'lucide-react';

interface VehicleInfo {
  year?: number;
  make?: string;
  model?: string;
}

interface VehicleInfoFormProps {
  vehicleInfo: VehicleInfo;
  onVehicleInfoChange: (info: VehicleInfo) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

const popularMakes = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi',
  'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Subaru', 'Mazda', 'Lexus',
  'Jeep', 'Ram', 'GMC', 'Dodge', 'Tesla', 'Volvo', 'Porsche', 'Land Rover',
  'Jaguar', 'Infiniti', 'Acura', 'Cadillac', 'Buick', 'Chrysler', 'Lincoln', 'Other'
];

export function VehicleInfoForm({ vehicleInfo, onVehicleInfoChange }: VehicleInfoFormProps) {
  const [showOptional, setShowOptional] = useState(
    !!(vehicleInfo.year || vehicleInfo.make || vehicleInfo.model)
  );

  const handleChange = (field: keyof VehicleInfo, value: string | number) => {
    onVehicleInfoChange({
      ...vehicleInfo,
      [field]: value || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Vehicle Information</h3>
          <p className="text-sm text-gray-500">Optional - helps improve accuracy</p>
        </div>
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showOptional ? 'Hide' : 'Add Details'}
        </button>
      </div>

      {showOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Year */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Calendar className="w-4 h-4 mr-1.5" />
              Year
            </label>
            <select
              value={vehicleInfo.year || ''}
              onChange={(e) => handleChange('year', e.target.value ? parseInt(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Make */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Factory className="w-4 h-4 mr-1.5" />
              Make
            </label>
            <select
              value={vehicleInfo.make || ''}
              onChange={(e) => handleChange('make', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Select Make</option>
              {popularMakes.map((make) => (
                <option key={make} value={make}>
                  {make}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1.5">
              <Car className="w-4 h-4 mr-1.5" />
              Model
            </label>
            <input
              type="text"
              value={vehicleInfo.model || ''}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="e.g., Camry, Civic"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
