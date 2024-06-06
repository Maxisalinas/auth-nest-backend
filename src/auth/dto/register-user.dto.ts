import { IsEmail, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
    
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsNumber()
    age: number;
        

}