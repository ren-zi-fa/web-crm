import { Badge } from '@/components/ui/badge';

type Props = {
    name: string;
    color?: string | null;
    isWon?: boolean;
    isLost?: boolean;
};

export default function StageBadge({ name, color, isWon, isLost }: Props) {
    return (
        <Badge
            variant={isWon ? 'default' : isLost ? 'destructive' : 'secondary'}
            className="gap-1.5"
        >
            <span
                className="size-2 rounded-full"
                style={{ backgroundColor: color ?? '#64748b' }}
            />
            {name}
        </Badge>
    );
}
