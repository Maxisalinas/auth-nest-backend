import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from '../interfaces/jwt.interface';
import { AuthService } from '../auth.service';


@Injectable()
export class AuthGuard implements CanActivate {


    constructor( private jwtService: JwtService,
                private authService: AuthService,
     ) {};


    
    async canActivate( context: ExecutionContext ): Promise<boolean> {   // 'ExecutionContext' nos da acceso a la request.

        const request =  context.switchToHttp().getRequest();    // EXTRAEMOS LA REQUEST 
        const token = this.extractTokenFromHeader(request);      // EXTRAEMOS EL TOKEN DEL HEADER DE LA REQUEST (ES UN STANDAR DEL FRONT MANDAR EL TOKEN ASI)

        if( !token ) {
            throw new UnauthorizedException('Token not found')    // VALIDAMOS SI EL TOKEN EXISTE   
        }; 

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>( token, { secret: process.env.JWT_SEED } );    // VERIFICAMOS EL TOKEN
            const user = await this.authService.findUserById( payload.id );
          
            if( !user ) {
                throw new UnauthorizedException('User not found');
            };

            if( !(await user).isActive ) {
                throw new UnauthorizedException("User isn't active");
            }

            request['user'] =  user ;

        } catch (error) {

            throw new UnauthorizedException('Token not valid');   
        };

        return true; 
    }

    private extractTokenFromHeader(request: Request): string | undefined {                // METODO PROVISTO POR NEST ENCARGADO DE EXTRAER EL TOKEN 

        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        
        return type === 'Bearer' ? token : undefined;
    }

} 

