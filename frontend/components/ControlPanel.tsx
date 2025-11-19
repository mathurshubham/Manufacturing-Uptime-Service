import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Activity, Thermometer, Settings, Gauge, Disc, FlaskConical } from 'lucide-react';
import { FormValues, formSchema, MachineType } from '../types';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent, SelectNative } from './ui/primitives';
import { cn } from '../lib/utils';

interface ControlPanelProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

const TEST_SCENARIOS = [
  {
    id: 'normal',
    label: 'Normal (Safe)',
    description: "A healthy machine running smoothly.",
    data: {
      type: MachineType.M,
      airTemp: 298.5,
      processTemp: 309.1,
      rotationalSpeed: 1500,
      torque: 40.2,
      toolWear: 10,
    },
    className: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
  },
  {
    id: 'failure',
    label: 'Failure (Critical)',
    description: "A machine under extreme load with significant wear, a classic failure scenario.",
    data: {
      type: MachineType.L,
      airTemp: 301.8,
      processTemp: 311.2,
      rotationalSpeed: 1380,
      torque: 75.3,
      toolWear: 215,
    },
    className: "border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50"
  },
  {
    id: 'borderline',
    label: 'Borderline',
    description: "A machine with high, but not extreme, wear and load. This tests the sensitivity of the tuned model.",
    data: {
      type: MachineType.H,
      airTemp: 302.4,
      processTemp: 311.6,
      rotationalSpeed: 1450,
      torque: 58.5,
      toolWear: 170,
    },
    className: "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/50"
  },
  {
    id: 'tool_fatigue',
    label: 'Tool Fatigue',
    description: "Even with low stress, an old tool is a major risk.",
    data: {
      type: MachineType.L,
      airTemp: 298.9,
      processTemp: 309.1,
      rotationalSpeed: 1400,
      torque: 38.5,
      toolWear: 225,
    },
    className: "border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/50"
  },
  {
    id: 'overheating',
    label: 'Overheating',
    description: "Air temperature is high, causing the process temperature to spike, putting the machine at risk.",
    data: {
      type: MachineType.H,
      airTemp: 303.9,
      processTemp: 313.5,
      rotationalSpeed: 1550,
      torque: 45.0,
      toolWear: 90,
    },
    className: "border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900 dark:text-orange-400 dark:hover:bg-orange-900/50"
  },
  {
    id: 'low_quality_strain',
    label: 'Low Quality Strain',
    description: "A \"Low Quality\" (Type L) machine operating at the upper limit of its safe torque range.",
    data: {
      type: MachineType.L,
      airTemp: 299.5,
      processTemp: 310.2,
      rotationalSpeed: 1350,
      torque: 62.0,
      toolWear: 110,
    },
    className: "border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/50"
  },
  {
    id: 'high_speed_safe',
    label: 'High Speed (Safe)',
    description: "The machine is running very fast, but torque is low (idling), so it should be safe.",
    data: {
      type: MachineType.H,
      airTemp: 297.5,
      processTemp: 308.0,
      rotationalSpeed: 2200,
      torque: 15.5,
      toolWear: 40,
    },
    className: "border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
  }
];

export const ControlPanel: React.FC<ControlPanelProps> = ({ onSubmit, isLoading }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: MachineType.L,
      airTemp: 298.1,
      processTemp: 308.6,
      rotationalSpeed: 1551,
      torque: 42.8,
      toolWear: 0,
    }
  });

  return (
    <Card className="h-full border-l-4 border-l-blue-500 shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-xl">Sensor Controls</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">Enter real-time telemetry data for analysis.</p>
        
        {/* Test Scenarios Section */}
        <div className="pt-4 pb-1">
          <Label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" /> Load Test Data
          </Label>
          <div className="flex flex-wrap gap-2">
            {TEST_SCENARIOS.map((scenario) => (
              <Button 
                key={scenario.id}
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => reset(scenario.data)}
                title={scenario.description}
                className={cn("h-7 text-xs transition-colors", scenario.className)}
              >
                {scenario.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* Machine Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Machine Quality Type</Label>
            <SelectNative id="type" {...register('type')}>
              <option value={MachineType.L}>Low Quality (L)</option>
              <option value={MachineType.M}>Medium Quality (M)</option>
              <option value={MachineType.H}>High Quality (H)</option>
            </SelectNative>
            {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Air Temp */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5" htmlFor="airTemp">
                <Thermometer className="w-3.5 h-3.5 text-blue-400" /> Air Temp [K]
              </Label>
              <Input 
                id="airTemp" 
                type="number" 
                step="0.1" 
                {...register('airTemp', { valueAsNumber: true })} 
              />
              {errors.airTemp && <p className="text-xs text-red-500">{errors.airTemp.message}</p>}
            </div>

            {/* Process Temp */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5" htmlFor="processTemp">
                <Thermometer className="w-3.5 h-3.5 text-red-400" /> Process Temp [K]
              </Label>
              <Input 
                id="processTemp" 
                type="number" 
                step="0.1" 
                {...register('processTemp', { valueAsNumber: true })} 
              />
              {errors.processTemp && <p className="text-xs text-red-500">{errors.processTemp.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Rotational Speed */}
             <div className="space-y-2">
              <Label className="flex items-center gap-1.5" htmlFor="rotationalSpeed">
                <Disc className="w-3.5 h-3.5 text-slate-500" /> Speed [RPM]
              </Label>
              <Input 
                id="rotationalSpeed" 
                type="number" 
                {...register('rotationalSpeed', { valueAsNumber: true })} 
              />
              {errors.rotationalSpeed && <p className="text-xs text-red-500">{errors.rotationalSpeed.message}</p>}
            </div>

            {/* Torque */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5" htmlFor="torque">
                <Gauge className="w-3.5 h-3.5 text-slate-500" /> Torque [Nm]
              </Label>
              <Input 
                id="torque" 
                type="number" 
                step="0.1"
                {...register('torque', { valueAsNumber: true })} 
              />
              {errors.torque && <p className="text-xs text-red-500">{errors.torque.message}</p>}
            </div>
          </div>

          {/* Tool Wear */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5" htmlFor="toolWear">
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> Tool Wear [min]
            </Label>
            <Input 
              id="toolWear" 
              type="number" 
              {...register('toolWear', { valueAsNumber: true })} 
            />
            {errors.toolWear && <p className="text-xs text-red-500">{errors.toolWear.message}</p>}
          </div>

          <Button type="submit" className="w-full mt-4 bg-slate-900 dark:bg-slate-100" size="lg" isLoading={isLoading}>
            {isLoading ? 'Analyzing...' : 'Run Diagnostics'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};