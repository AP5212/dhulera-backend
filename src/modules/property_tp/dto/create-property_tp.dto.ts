import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreatePropertyTpDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    
    @IsOptional()
    @IsString()
    createdBy?: string;
    
    @IsOptional()
    @IsString()
    status?: string;
}
