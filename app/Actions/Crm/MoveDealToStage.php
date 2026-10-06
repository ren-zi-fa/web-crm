<?php

namespace App\Actions\Crm;

use App\Enums\LifecycleStage;
use App\Models\Deal;
use App\Models\DealStage;

class MoveDealToStage
{
    /**
     * Move a deal to the given stage and keep the contact lifecycle in sync.
     */
    public function handle(Deal $deal, DealStage $stage, ?string $lostReason = null): Deal
    {
        $deal->deal_stage_id = $stage->id;
        $deal->won_at = $stage->is_won ? ($deal->won_at ?? now()) : null;
        $deal->lost_reason = $stage->is_lost ? $lostReason : null;
        $deal->save();

        if ($stage->is_won) {
            $deal->contact()->update([
                'lifecycle_stage' => LifecycleStage::Customer,
            ]);
        }

        return $deal;
    }
}
