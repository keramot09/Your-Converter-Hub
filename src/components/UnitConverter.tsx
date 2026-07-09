import React, { useState } from 'react';
import { Ruler, ArrowRightLeft } from 'lucide-react';

export function UnitConverter() {
  const [category, setCategory] = useState<'weight' | 'length' | 'temperature' | 'data' | 'speed'>('weight');
  const [fromUnit, setFromUnit] = useState('kg');
  const [toUnit, setToUnit] = useState('lb');
  const [inputValue, setInputValue] = useState('1');

  const categories = [
    { id: 'weight', label: 'Weight & Mass', units: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 } },
    { id: 'length', label: 'Length & Distance', units: { m: 1, cm: 0.01, mm: 0.001, km: 1000, inch: 0.0254, ft: 0.3048, mi: 1609.34 } },
    { id: 'temperature', label: 'Temperature', units: { c: 1, f: 1, k: 1 } },
    { id: 'data', label: 'Data Storage', units: { b: 1, kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 } },
    { id: 'speed', label: 'Speed', units: { mps: 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444 } }
  ];

  const currentCat = categories.find((c) => c.id === category)!;
  const unitKeys = Object.keys(currentCat.units);

  const handleCategoryChange = (catId: any) => {
    setCategory(catId);
    const newCat = categories.find((c) => c.id === catId)!;
    const keys = Object.keys(newCat.units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const calculateResult = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return '0';

    if (category === 'temperature') {
      let celsius = val;
      if (fromUnit === 'f') celsius = (val - 32) * (5 / 9);
      if (fromUnit === 'k') celsius = val - 273.15;

      let result = celsius;
      if (toUnit === 'f') result = celsius * (9 / 5) + 32;
      if (toUnit === 'k') result = celsius + 273.15;
      return result.toFixed(2);
    }

    const units = currentCat.units;
    const baseValue = val * (units as any)[fromUnit];
    const converted = baseValue / (units as any)[toUnit];
    return converted < 0.00001 ? converted.toExponential(4) : converted.toFixed(4);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
            <Ruler className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Unit Converter</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Perform precise conversions across weight, length, temperature, data storage, and speed measurements.
            </p>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider transition-all ${
                category === cat.id
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          {/* From */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              From
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              {unitKeys.map((u) => (
                <option key={u} value={u}>{u.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
          </div>

          {/* To */}
          <div className="md:col-span-2 space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              To
            </label>
            <div className="w-full px-4 py-3 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 rounded-xl text-lg font-extrabold text-cyan-700 dark:text-cyan-300 truncate">
              {calculateResult()}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200"
            >
              {unitKeys.map((u) => (
                <option key={u} value={u}>{u.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
