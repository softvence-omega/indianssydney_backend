import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateApplyFoContibutorDto{
      
     

      @ApiProperty({
        example:"make the about ",
        required: true,
      })
       @IsString()
      about: string;

}