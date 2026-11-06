<?php

namespace App\Filament\Resources\Registos;

use App\Filament\Resources\Registos\Pages\CreateRegisto;
use App\Filament\Resources\Registos\Pages\EditRegisto;
use App\Filament\Resources\Registos\Pages\ListRegistos;
use App\Filament\Resources\Registos\Schemas\RegistoForm;
use App\Filament\Resources\Registos\Tables\RegistosTable;
use App\Models\Registo;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class RegistoResource extends Resource
{
    protected static ?string $model = Registo::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClipboardDocumentList;

    protected static ?string $navigationLabel = 'Registos';

    protected static ?string $modelLabel = 'Registo';

    protected static ?string $pluralModelLabel = 'Registos';

    protected static string|UnitEnum|null $navigationGroup = 'Gestão';

    protected static ?string $recordTitleAttribute = 'email';

    public static function form(Schema $schema): Schema
    {
        return RegistoForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return RegistosTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListRegistos::route('/'),
            'create' => CreateRegisto::route('/create'),
            'edit' => EditRegisto::route('/{record}/edit'),
        ];
    }
}
