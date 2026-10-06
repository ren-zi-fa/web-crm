<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Database\Factories\DealFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $contact_id
 * @property int $deal_stage_id
 * @property string $title
 * @property string $value
 * @property CarbonImmutable|null $expected_close_date
 * @property int|null $assigned_to
 * @property string|null $source
 * @property string|null $lost_reason
 * @property CarbonImmutable|null $won_at
 */
#[Fillable([
    'contact_id',
    'deal_stage_id',
    'title',
    'value',
    'expected_close_date',
    'assigned_to',
    'source',
    'lost_reason',
    'won_at',
])]
class Deal extends Model
{
    /** @use HasFactory<DealFactory> */
    use HasFactory;

    use SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'expected_close_date' => 'date',
            'won_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Contact, $this>
     */
    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    /**
     * @return BelongsTo<DealStage, $this>
     */
    public function stage(): BelongsTo
    {
        return $this->belongsTo(DealStage::class, 'deal_stage_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function assignedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * @return MorphMany<Activity, $this>
     */
    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'activitable');
    }

    /**
     * @return MorphMany<Task, $this>
     */
    public function tasks(): MorphMany
    {
        return $this->morphMany(Task::class, 'taskable');
    }

    /**
     * @param  Builder<Deal>  $query
     * @return Builder<Deal>
     */
    public function scopeOpen(Builder $query): Builder
    {
        return $query->whereHas('stage', fn (Builder $query): Builder => $query->where('is_won', false)->where('is_lost', false));
    }
}
