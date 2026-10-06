import { router } from '@inertiajs/react';
import { CheckCircle2, Circle } from 'lucide-react';
import TaskController from '@/actions/App/Http/Controllers/TaskController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import type { TaskItem } from '@/types';

const priorityVariant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
> = {
    low: 'outline',
    medium: 'secondary',
    high: 'default',
    urgent: 'destructive',
};

export default function TaskList({
    tasks,
    showRelated = false,
}: {
    tasks: TaskItem[];
    showRelated?: boolean;
}) {
    if (tasks.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">Belum ada tugas.</p>
        );
    }

    const toggle = (task: TaskItem) => {
        router.patch(
            TaskController.complete.url(task.id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <ul className="space-y-2">
            {tasks.map((task) => {
                const done = task.status === 'completed';

                return (
                    <li
                        key={task.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0"
                            onClick={() => toggle(task)}
                            aria-label={
                                done ? 'Tandai belum selesai' : 'Tandai selesai'
                            }
                        >
                            {done ? (
                                <CheckCircle2 className="size-5 text-green-600" />
                            ) : (
                                <Circle className="size-5 text-muted-foreground" />
                            )}
                        </Button>
                        <div className="min-w-0 flex-1">
                            <p
                                className={
                                    done
                                        ? 'text-muted-foreground line-through'
                                        : ''
                                }
                            >
                                {task.title}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                {task.due_at && (
                                    <span>
                                        Jatuh tempo{' '}
                                        {formatDate(task.due_at, true)}
                                    </span>
                                )}
                                <Badge
                                    variant={
                                        priorityVariant[task.priority] ??
                                        'secondary'
                                    }
                                >
                                    {task.priority_label}
                                </Badge>
                                {showRelated && task.related && (
                                    <span>• {task.related.name}</span>
                                )}
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
