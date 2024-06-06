import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register-user.dto';

import { JwtPayload } from './interfaces/jwt.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { LoginResponse } from './interfaces/login-response';



@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService,
        
    ) { }


    async create(createUserDto: CreateUserDto): Promise<User> {

        try {
            
            const { password, ...userData } = createUserDto;    // DESESTRUCTURAMOS EL DTO

            const newUser = new this.userModel({ password: bcryptjs.hashSync(password, 10), ...userData });  // ENCRIPTAMOS EL PASSWORD

            await newUser.save(); // GUARDAMOS EN BASE DE DATOS

            const { password: _, ...user } = newUser.toJSON();

            return user;

        }

        catch (error) {
            if (error.code === 11000) {
                throw new BadRequestException(`${createUserDto.email} already exist!`)
            }
            throw new InternalServerErrorException('Something terrible happen!!')
        }
    };

    async login(loginDto: LoginDto): Promise<LoginResponse> {

        const { email, password } = loginDto;  // DESESTRUCTURAMOS EL DTO 

        const user = await this.userModel.findOne({ email });   // BUSCAMOS AL USUARIO POR SU EMAIL.

        if (!user) {                // SI EL USUARIO NO EXISTE
            throw new UnauthorizedException('Not valid credentials - email error')
        }

        if (!bcryptjs.compareSync(password, user.password)) {    // BUSCAMOS SI COINCIDE LA PASSWORD ENCRIPTADA
            throw new UnauthorizedException('Not valid credentials - password error')
        }

        const { password: _, ...rest } = user.toJSON();      // DESESTRUCTURAMOS EL USUARIO PARA NO DEVOLVER EL PASSWORD Y LO PASAMOS A JSON

        return { user: rest, token: this.getJwtToken({ id: user.id }) };    //   GENERAMOS UN RESPONSE CON UN TOKEN DE ACCESO.

    }

    async register(registerDto: RegisterDto): Promise<LoginResponse> { 
        
        const { age , ...dataUser } = registerDto;

        if( age < 18 ) {
            throw new UnauthorizedException('Register Error')
        }

        const user = await this.create( dataUser );   
 
        return { 
            user: user,
            token: this.getJwtToken( { id: user._id } ),
        }
    };



    getJwtToken(payload: JwtPayload) {

        const token = this.jwtService.sign(payload);

        return token;
    }


    findAll(): Promise<User[]> {
        return this.userModel.find();
    }

    async findUserById( id: string ) {
        const user = await this.userModel.findById( id );
        const { password, ...rest } = user.toJSON();
        return rest;
      }



// update(id: number, updateAuthDto: UpdateAuthDto) {
//   return `This action updates a #${id} auth`;
// }

// remove(id: number) {
//   return `This action removes a #${id} auth`;
// }
}