<?php

namespace App\Filament\Resources\Registos\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class RegistosTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('nome')
                    ->label('Nome')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('agencia')
                    ->label('Agência')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('estado')
                    ->label('Estado')
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'Por contactar' => 'warning',
                        'Contactado' => 'success',
                        'Rejeitado' => 'danger',
                        default => 'gray',
                    })
                    ->sortable(),
                TextColumn::make('colaborador')
                    ->label('Colaborador')
                    ->searchable()
                    ->toggleable(),
                TextColumn::make('meio_contacto')
                    ->label('Meio de contacto')
                    ->badge()
                    ->toggleable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('estado')
                    ->label('Estado')
                    ->options([
                        'Por contactar' => 'Por contactar',
                        'Contactado' => 'Contactado',
                        'Rejeitado' => 'Rejeitado',
                    ]),
                SelectFilter::make('meio_contacto')
                    ->label('Meio de contacto')
                    ->options([
                        'WhatsApp' => 'WhatsApp',
                        'Telefone' => 'Telefone',
                        'Email' => 'Email',
                    ]),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
