<?php

namespace App\Enums;

enum ActivityType: string
{
    case Call = 'call';
    case Email = 'email';
    case Meeting = 'meeting';
    case Note = 'note';
    case Whatsapp = 'whatsapp';

    public function label(): string
    {
        return match ($this) {
            self::Call => 'Telepon',
            self::Email => 'Email',
            self::Meeting => 'Meeting',
            self::Note => 'Catatan',
            self::Whatsapp => 'WhatsApp',
        };
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return array_map(
            fn (self $type): array => ['value' => $type->value, 'label' => $type->label()],
            self::cases(),
        );
    }
}
