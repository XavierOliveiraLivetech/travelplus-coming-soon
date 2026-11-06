<?php

namespace App\Filament\Resources\Registos\Pages;

use App\Filament\Resources\Registos\RegistoResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListRegistos extends ListRecords
{
    protected static string $resource = RegistoResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
