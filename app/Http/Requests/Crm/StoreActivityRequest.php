<?php

namespace App\Http\Requests\Crm;

use App\Enums\ActivityType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreActivityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(ActivityType::class)],
            'subject' => ['nullable', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'occurred_at' => ['required', 'date'],
            'activitable_type' => ['nullable', Rule::in(['contact', 'deal'])],
            'activitable_id' => ['nullable', 'integer', 'required_with:activitable_type'],
        ];
    }
}
