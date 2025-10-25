import { Transaction } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionCardProps {
  transaction: Transaction;
  onClick?: () => void;
}

export function TransactionCard({ transaction, onClick }: TransactionCardProps) {
  const statusConfig = {
    approved: {
      icon: CheckCircle2,
      badge: 'success',
      bgClass: 'bg-success-light',
      iconClass: 'text-success'
    },
    pending_approval: {
      icon: Clock,
      badge: 'warning',
      bgClass: 'bg-warning-light',
      iconClass: 'text-warning'
    },
    rejected: {
      icon: XCircle,
      badge: 'destructive',
      bgClass: 'bg-destructive-light',
      iconClass: 'text-destructive'
    }
  };

  const config = statusConfig[transaction.status];
  const Icon = config.icon;

  return (
    <Card 
      className={cn(
        "p-6 cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:scale-[1.02]"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-lg", config.bgClass)}>
            <Icon className={cn("h-8 w-8", config.iconClass)} />
          </div>
          <div>
            <p className="font-bold text-xl text-foreground">{transaction.vendor}</p>
            <p className="text-lg text-muted-foreground">
              {new Date(transaction.timestamp).toLocaleDateString('en-IN')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-2xl text-foreground">₹{transaction.amount}</p>
          <Badge variant={config.badge as any} className="mt-2 text-base px-3 py-1">
            {transaction.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>
    </Card>
  );
}
