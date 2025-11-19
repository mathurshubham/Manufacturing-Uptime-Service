import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { HistoryItem } from '../types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from './ui/primitives';
import { formatPercent } from '../lib/utils';

interface HistoryListProps {
  history: HistoryItem[];
}

export const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  return (
    <Card className="h-full border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-4 h-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 space-y-3">
        {history.length === 0 ? (
          <div className="text-sm text-muted-foreground italic py-4 text-center border rounded-md bg-muted/30">
            No recent predictions.
          </div>
        ) : (
          history.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                {item.status === 'Failure Imminent' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">
                    {item.type} - {item.status}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="ml-auto font-mono text-xs">
                {formatPercent(item.probability)}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};