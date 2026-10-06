<?php

namespace App\Enums;

enum LifecycleStage: string
{
    case Lead = 'lead';
    case Prospect = 'prospect';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Lead => 'Lead',
            self::Prospect => 'Prospek',
            self::Customer => 'Pelanggan',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $stage): array => ['value' => $stage->value, 'label' => $stage->label()],
            self::cases(),
        );
    }
}
