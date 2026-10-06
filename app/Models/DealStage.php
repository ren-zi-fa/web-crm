<?php

namespace App\Models;

use Database\Factories\DealStageFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $sort_order
 * @property string|null $color
 * @property bool $is_won
 * @property bool $is_lost
 * @property int $deals_count
 * @property string|null $deals_sum_value
 */
#[Fillable(['name', 'slug', 'sort_order', 'color', 'is_won', 'is_lost'])]
class DealStage extends Model
{
    /** @use HasFactory<DealStageFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_won' => 'boolean',
            'is_lost' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Deal, $this>
     */
    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    /**
     * @param  Builder<DealStage>  $query
     * @return Builder<DealStage>
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order');
    }
}
