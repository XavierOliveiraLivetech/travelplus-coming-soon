<?php

namespace App\Filament\Resources\Registos\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;

class RegistoForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->disabled(),
                TextInput::make('nome')
                    ->label('Nome')
                    ->maxLength(255),
                TextInput::make('agencia')
                    ->label('Agência')
                    ->maxLength(255),
                Grid::make(3)
                    ->columnSpanFull()
                    ->schema([
                        TextInput::make('telefone')
                            ->label('Telemóvel')
                            ->tel()
                            ->maxLength(255),
                        TextInput::make('whatsapp')
                            ->label('WhatsApp')
                            ->tel()
                            ->maxLength(255),
                        Select::make('estado')
                            ->label('Estado')
                            ->options([
                                'Por contactar' => 'Por contactar',
                                'Contactado' => 'Contactado',
                                'Rejeitado' => 'Rejeitado',
                            ])
                            ->required()
                            ->default('Por contactar')
                            ->native(false)
                            ->live(),
                    ]),
                Grid::make(3)
                    ->columnSpanFull()
                    ->visible(fn (Get $get): bool => $get('estado') === 'Contactado')
                    ->schema([
                        TextInput::make('colaborador')
                            ->label('Colaborador')
                            ->maxLength(255),
                        Select::make('meio_contacto')
                            ->label('Meio de contacto')
                            ->placeholder('Selecione o meio de contacto')
                            ->options([
                                'WhatsApp' => 'WhatsApp',
                                'Telemóvel' => 'Telemóvel',
                                'Email' => 'Email',
                            ])
                            ->native(false),
                        DatePicker::make('data_contactado')
                            ->label('Data de contacto')
                            ->native(false)
                            ->displayFormat('d/m/Y'),
                    ]),
                TextInput::make('motivo_rejeicao')
                    ->label('Motivo de rejeição')
                    ->maxLength(255)
                    ->visible(fn (Get $get): bool => $get('estado') === 'Rejeitado'),
                DatePicker::make('data_rejeitado')
                    ->label('Data de rejeição')
                    ->native(false)
                    ->displayFormat('d/m/Y')
                    ->visible(fn (Get $get): bool => $get('estado') === 'Rejeitado'),
                Textarea::make('observacoes')
                    ->label('Observações')
                    ->rows(4)
                    ->columnSpanFull(),
            ]);
    }
}
