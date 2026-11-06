<?php

namespace App\Filament\Resources\Registos\Pages;

use App\Filament\Resources\Registos\RegistoResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditRegisto extends EditRecord
{
    protected static string $resource = RegistoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
