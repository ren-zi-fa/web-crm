import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import type { ActivityItem } from '@/types';

export default function ActivityTimeline({
    activities,
}: {
    activities: ActivityItem[];
}) {
    if (activities.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Belum ada aktivitas.
            </p>
        );
    }

    return (
        <ol className="space-y-4 border-l pl-4">
            {activities.map((activity) => (
                <li key={activity.id} className="relative">
                    <span className="absolute top-1.5 -left-[21px] size-2.5 rounded-full bg-primary" />
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{activity.type_label}</Badge>
                        <span className="text-xs text-muted-foreground">
                            {formatDate(activity.occurred_at, true)}
                        </span>
                        {activity.user && (
                            <span className="text-xs text-muted-foreground">
                                • {activity.user.name}
                            </span>
                        )}
                    </div>
                    {activity.subject && (
                        <p className="mt-1 font-medium">{activity.subject}</p>
                    )}
                    {activity.body && (
                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                            {activity.body}
                        </p>
                    )}
                </li>
            ))}
        </ol>
    );
}
