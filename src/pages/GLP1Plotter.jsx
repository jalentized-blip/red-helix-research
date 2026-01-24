import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const peptideData = {
  semaglutide: { halfLife: 168, name: 'Semaglutide (Ozempic/Wegovy)' },
  tirzepatide: { halfLife: 120, name: 'Tirzepatide (Mounjaro)' },
  retatrutide: { halfLife: 144, name: 'Retatrutide' },
};

// Pharmacokinetic calculation: C(t) = C0 * e^(-kt)
// where k = ln(2) / halfLife
const calculateConcentration = (initialDose, hoursElapsed, halfLife) => {
  const k = Math.log(2) / halfLife;
  return initialDose * Math.exp(-k * hoursElapsed);
};

const generatePlotData = (injections, halfLife, days = 84) => {
  const hours = days * 24;
  const data = [];

  for (let h = 0; h <= hours; h += 12) {
    let totalConc = 0;
    injections.forEach((inj) => {
      const injectionHour = inj.dayNumber * 24;
      if (h >= injectionHour) {
        const hoursElapsed = h - injectionHour;
        totalConc += calculateConcentration(inj.dose, hoursElapsed, halfLife);
      }
    });

    const day = Math.floor(h / 24);
    if (data.length === 0 || data[data.length - 1].day !== day) {
      data.push({
        day,
        time: `Day ${day}`,
        concentration: parseFloat(totalConc.toFixed(4)),
      });
    }
  }

  return data;
};

export default function GLP1Plotter() {
  const [peptideType, setPeptideType] = useState('semaglutide');
  const [injections, setInjections] = useState([
    { id: 1, dayNumber: 0, dose: 0.25, dosageUnit: 'mg' },
    { id: 2, dayNumber: 7, dose: 0.25, dosageUnit: 'mg' },
    { id: 3, dayNumber: 14, dose: 0.25, dosageUnit: 'mg' },
  ]);
  const [nextId, setNextId] = useState(4);
  const [plotDays, setPlotDays] = useState(84);

  const plotData = useMemo(
    () => generatePlotData(injections, peptideData[peptideType].halfLife, plotDays),
    [injections, peptideType, plotDays]
  );

  const addInjection = () => {
    const lastDay = Math.max(...injections.map((i) => i.dayNumber), 0);
    setInjections([...injections, { id: nextId, dayNumber: lastDay + 7, dose: 0.25, dosageUnit: 'mg' }]);
    setNextId(nextId + 1);
  };

  const removeInjection = (id) => {
    if (injections.length > 1) {
      setInjections(injections.filter((inj) => inj.id !== id));
    }
  };

  const updateInjection = (id, field, value) => {
    setInjections(
      injections.map((inj) =>
        inj.id === id ? { ...inj, [field]: field === 'dayNumber' || field === 'dose' ? parseFloat(value) || 0 : value } : inj
      )
    );
  };

  const maxConcentration = Math.max(...plotData.map((d) => d.concentration), 0);
  const minConcentration = Math.min(...plotData.map((d) => d.concentration), 0);

  return (
    <div className="min-h-screen bg-stone-950 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <Link to={createPageUrl('Home')} className="inline-flex items-center gap-2 text-barn-brown hover:text-barn-tan mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black text-amber-50 mb-4">GLP-1 Blood Concentration Plotter</h1>
          <p className="text-xl text-amber-100">Visualize peptide concentration levels over time based on your dosing schedule</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Peptide Selection */}
            <Card className="bg-stone-900/50 border-stone-700 p-6">
              <h3 className="text-lg font-bold text-amber-50 mb-4">Peptide Type</h3>
              <Select value={peptideType} onValueChange={setPeptideType}>
                <SelectTrigger className="bg-stone-800 border-stone-600 text-amber-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stone-900 border-stone-700">
                  {Object.entries(peptideData).map(([key, value]) => (
                    <SelectItem key={key} value={key} className="text-amber-50">
                      {value.name} (Half-life: {value.halfLife}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Timeline */}
            <Card className="bg-stone-900/50 border-stone-700 p-6">
              <h3 className="text-lg font-bold text-amber-50 mb-4">Plot Duration</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-amber-100 text-sm mb-2">Days to display: {plotDays}</label>
                  <input
                    type="range"
                    min="28"
                    max="365"
                    step="7"
                    value={plotDays}
                    onChange={(e) => setPlotDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </Card>

            {/* Stats */}
            <Card className="bg-gradient-to-r from-barn-brown/20 to-barn-tan/10 border border-barn-brown/30 p-6">
              <h3 className="text-lg font-bold text-amber-50 mb-4">Statistics</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-stone-400">Peak Concentration</p>
                  <p className="text-2xl font-bold text-barn-tan">{maxConcentration.toFixed(4)} mg/L</p>
                </div>
                <div>
                  <p className="text-stone-400">Trough Concentration</p>
                  <p className="text-2xl font-bold text-barn-tan">{minConcentration.toFixed(4)} mg/L</p>
                </div>
                <div>
                  <p className="text-stone-400">Total Injections</p>
                  <p className="text-2xl font-bold text-barn-tan">{injections.length}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Graph */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-stone-900/50 border-stone-700 p-6 h-full">
              <h3 className="text-lg font-bold text-amber-50 mb-4">Blood Concentration Over Time</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={plotData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="time" stroke="#a1a1a1" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#a1a1a1" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #404040', borderRadius: '8px' }}
                    labelStyle={{ color: '#f5e6d3' }}
                    formatter={(value) => [value.toFixed(4) + ' mg/L', 'Concentration']}
                  />
                  <Legend wrapperStyle={{ color: '#a1a1a1' }} />
                  <Line
                    type="monotone"
                    dataKey="concentration"
                    stroke="#C4955B"
                    strokeWidth={3}
                    dot={false}
                    name="Blood Concentration"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </div>

        {/* Injection Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="bg-stone-900/50 border-stone-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-50">Injection Schedule</h3>
              <Button
                onClick={addInjection}
                className="bg-barn-brown hover:bg-barn-brown/90 text-amber-50 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Injection
              </Button>
            </div>

            <div className="space-y-4">
              {injections
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((inj) => (
                  <motion.div
                    key={inj.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-4 items-end bg-stone-800/50 border border-stone-700 rounded-lg p-4"
                  >
                    <div className="flex-1">
                      <label className="block text-amber-100 text-sm font-semibold mb-2">Day</label>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={inj.dayNumber}
                        onChange={(e) => updateInjection(inj.id, 'dayNumber', e.target.value)}
                        className="bg-stone-700 border-stone-600 text-amber-50"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-amber-100 text-sm font-semibold mb-2">Dose</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.05"
                        value={inj.dose}
                        onChange={(e) => updateInjection(inj.id, 'dose', e.target.value)}
                        className="bg-stone-700 border-stone-600 text-amber-50"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-amber-100 text-sm font-semibold mb-2">Unit</label>
                      <Select value={inj.dosageUnit} onValueChange={(value) => updateInjection(inj.id, 'dosageUnit', value)}>
                        <SelectTrigger className="bg-stone-700 border-stone-600 text-amber-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-stone-900 border-stone-700">
                          <SelectItem value="mg" className="text-amber-50">
                            mg
                          </SelectItem>
                          <SelectItem value="mcg" className="text-amber-50">
                            mcg
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => removeInjection(inj.id)}
                      variant="destructive"
                      size="icon"
                      className="bg-red-900/50 hover:bg-red-900 border border-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
            </div>
          </Card>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-12 grid md:grid-cols-2 gap-6"
        >
          <Card className="bg-stone-900/50 border-stone-700 p-6">
            <div className="flex gap-3 mb-4">
              <Info className="w-5 h-5 text-barn-brown flex-shrink-0 mt-0.5" />
              <h4 className="text-lg font-bold text-amber-50">How It Works</h4>
            </div>
            <p className="text-amber-100 text-sm leading-relaxed">
              This plotter uses pharmacokinetic modeling to calculate blood concentration levels based on your peptide's half-life and dosing schedule. Each injection adds to the existing concentration, and the drug is gradually eliminated according to exponential decay kinetics.
            </p>
          </Card>

          <Card className="bg-stone-900/50 border-stone-700 p-6">
            <div className="flex gap-3 mb-4">
              <Info className="w-5 h-5 text-barn-brown flex-shrink-0 mt-0.5" />
              <h4 className="text-lg font-bold text-amber-50">Disclaimer</h4>
            </div>
            <p className="text-amber-100 text-sm leading-relaxed">
              This is an educational tool for research purposes only. Actual blood concentrations may vary based on individual metabolism, injection site, and other biological factors. For accurate medical information, consult scientific literature and healthcare providers.
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8 text-center bg-stone-900/30 border border-stone-700 rounded-lg p-6"
        >
          <p className="text-amber-100">For Research and Laboratory Use Only</p>
        </motion.div>
      </div>
    </div>
  );
}