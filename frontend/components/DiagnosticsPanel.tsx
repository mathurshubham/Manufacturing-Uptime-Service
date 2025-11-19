import React from 'react';
import { AlertTriangle, CheckCircle2, Cpu, RefreshCw } from 'lucide-react';
import { PredictionResponse } from '../types';
import { Card, CardContent, CardHeader, CardTitle, Progress, Button, Badge } from './ui/primitives';
import { cn, formatPercent } from '../lib/utils';

interface DiagnosticsPanelProps {
  result: PredictionResponse | null;
  onClear: () => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ result, onClear }) => {
  if (!result) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center border-dashed bg-slate-50/50 dark:bg-slate-900/20 min-h-[300px]">
        <div className="p-8 space-y-4 max-w-md">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
            <Cpu className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">System Ready</h3>
          <p className="text-sm text-muted-foreground">
            Awaiting sensor data inputs. Configure the control panel on the left and click "Run Diagnostics" to analyze machine health.
          </p>
        </div>
      </Card>
    );
  }

  const isFailure = result.failure_probability > 0.50;
  const percentage = Math.round(result.failure_probability * 100);
  
  // Color logic
  const statusColor = isFailure ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400";
  const progressColor = isFailure ? "bg-red-500" : "bg-emerald-500";
  const borderColor = isFailure ? "border-red-200 dark:border-red-900" : "border-emerald-200 dark:border-emerald-900";
  const bgColor = isFailure ? "bg-red-50 dark:bg-red-950/30" : "bg-emerald-50 dark:bg-emerald-950/30";

  return (
    <Card className={cn("h-full border-2 shadow-lg overflow-hidden transition-all duration-500", borderColor)}>
      <CardHeader className={cn("border-b pb-4", bgColor)}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Diagnostics Result
            </CardTitle>
            <p className="text-muted-foreground mt-1 text-sm">
              AI Confidence Score
            </p>
          </div>
          <Badge variant={isFailure ? "destructive" : "success"} className="text-sm px-3 py-1 uppercase tracking-wide">
            {isFailure ? "Critical" : "Healthy"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-8 space-y-8">
        {/* Main Status Indicator */}
        <div className="text-center space-y-4">
          <div className={cn("mx-auto w-24 h-24 rounded-full flex items-center justify-center border-4 transition-colors duration-500", isFailure ? "bg-red-100 border-red-500" : "bg-emerald-100 border-emerald-500")}>
            {isFailure ? (
              <AlertTriangle className="w-12 h-12 text-red-600" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            )}
          </div>
          
          <div>
            <h2 className={cn("text-3xl font-bold tracking-tight", statusColor)}>
              {isFailure ? "Failure Imminent" : "Normal Operation"}
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
              {isFailure 
                ? "Immediate maintenance action required. High probability of component failure." 
                : "System is operating within nominal parameters. No immediate action required."}
            </p>
          </div>
        </div>

        {/* Gauge / Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Safety Margin</span>
            <span>{formatPercent(result.failure_probability)} Risk</span>
          </div>
          <Progress value={percentage} className="h-3" indicatorColor={progressColor} />
          <div className="flex justify-between text-xs text-muted-foreground pt-1">
            <span>Safe</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t">
          <Button variant="outline" onClick={onClear} className="w-full group">
            <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" /> 
            Reset Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};